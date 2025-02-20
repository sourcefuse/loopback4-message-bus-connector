import {inject, Provider} from '@loopback/core';
import {Queue, Worker} from 'bullmq';
import {BullMQBindings} from './keys';
import {Config} from './types';
import {ILogger, LOGGER} from '@sourceloop/core';

export class BullMQConsumerProvider implements Provider<void> {
  private readonly workers: Worker[] = [];
  private readonly maxWorkers: number;
  private readonly minWorkers: number;
  private readonly queuePollInterval: number;
  private shuttingDown = false;

  constructor(
    @inject(BullMQBindings.Config, {optional: true})
    private readonly bullMQConfig: Config,
    @inject(BullMQBindings.BullMQQueue, {optional: true})
    private readonly queue: Queue,

    @inject(BullMQBindings.BullMQConsumerHandler, {optional: true})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly  bullMQConsumerHandler: (message: any) => Promise<void>,

    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger,
  ) {
    this.minWorkers = this.bullMQConfig.consumerConfig?.MinConsumers ?? 1;
    this.maxWorkers = this.bullMQConfig.consumerConfig?.MaxConsumers ?? 10;
    this.queuePollInterval =
      this.bullMQConfig.consumerConfig?.QueuePollInterval ?? 1000;

    // Start with minimum workers
    for (let i = 0; i < this.minWorkers; i++) {
      this.addWorker();
    }
  }

  value(): void {
    this.startAutoScaler();
  }

  private addWorker(): void {
    const worker = new Worker(
      this.queue.name, // Use the queue name from injected queue instance
      async messageData => {
        await this.processMessage(messageData);
      },
      {
        connection: this.queue.opts.connection, // Use connection config from queue instance
      },
    );

    worker.on('completed', job => {
      this.logger.info(`Job ${job.id} has been completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed with error: ${err.message}`);
    });

    this.workers.push(worker);
    this.logger.info(`Worker added. Total workers: ${this.workers.length}`);
  }

  private async removeWorker(): Promise<void> {
    const worker = this.workers.pop();
    if (worker) {
      try {
        await worker.close();
        this.logger.info('Worker removed.');
      } catch (error) {
        this.logger.error('Error closing worker:', error);
      }
    }
  }

  private async autoScaler(): Promise<void> {
    try {
      const waitingCount = await this.queue.getWaitingCount();
      const currentWorkers = this.workers.length;
      if (waitingCount >= currentWorkers && currentWorkers <= this.maxWorkers) {
        this.addWorker();
      } else if (
        waitingCount < currentWorkers &&
        currentWorkers > this.minWorkers
      ) {
        await this.removeWorker();
      }
    } catch (error) {
      this.logger.error('Error in auto-scaler:', error);
    }
  }
  private startAutoScaler(): void {
    const autoScaler = setInterval(() => {
      if (this.shuttingDown) {
        clearInterval(autoScaler);
        return;
      }

      // eslint-disable-next-line no-void
      void this.autoScaler();
      // this.autoScaler();
    }, this.queuePollInterval);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async processMessage(job: any): Promise<void> {
    try {
      await this.bullMQConsumerHandler(job.data);
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  stop(): void {
    this.shuttingDown = true;

    for (const worker of this.workers) {
      worker
        .close()
        .then(() => this.logger.info('Worker closed.'))
        .catch(err => this.logger.error('Error closing worker:', err));
    }
  }
}
