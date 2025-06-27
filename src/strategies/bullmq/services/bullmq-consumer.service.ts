import {BindingScope, inject, injectable, service} from '@loopback/core';
import {Queue, Worker} from 'bullmq';
import {BullMQBindings} from '../keys';
import {BullMQConfig} from '../types';
import {ILogger, LOGGER} from '@sourceloop/core';
import {EventHandlerService} from '../../../services';
import {QueueType} from '../../../types';

@injectable({
  scope: BindingScope.TRANSIENT,
})
export class BullMQConsumerService {
  private readonly workers: Worker[] = [];
  private readonly maxWorkers: number;
  private readonly minWorkers: number;
  private readonly queuePollInterval: number;
  private shuttingDown = false;

  constructor(
    @inject(BullMQBindings.Config, {optional: true})
    private readonly bullMQConfig: BullMQConfig,
    @inject(BullMQBindings.BullMQQueue, {optional: true})
    private readonly queue: Queue,
    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger,
    @service(EventHandlerService)
    private eventHandler: EventHandlerService,
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

  public start(): void {
    this.startAutoScaler();
  }

  public stop(): void {
    this.shuttingDown = true;

    for (const worker of this.workers) {
      worker
        .close()
        .then(() => this.logger.info('Worker closed.'))
        .catch(err => this.logger.error('Error closing worker:', err));
    }
  }

  private addWorker(): void {
    const worker = new Worker(
      this.queue.name,
      async job => {
        await this.processMessage(job);
      },
      {
        connection: this.queue.opts.connection,
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
      await worker.close();
    }
  }

  private async autoScaler(): Promise<void> {
    const waitingCount = await this.queue.getWaitingCount();
    const currentWorkers = this.workers.length;
    if (waitingCount >= currentWorkers && currentWorkers < this.maxWorkers) {
      this.addWorker();
    } else if (
      waitingCount < currentWorkers &&
      currentWorkers > this.minWorkers
    ) {
      await this.removeWorker();
    } else {
      this.logger.debug(
        `AutoScaler: No scaling needed. Waiting count: ${waitingCount}, Current workers: ${currentWorkers}`,
      );
    }
  }

  private startAutoScaler(): void {
    const interval = setInterval(() => {
      if (this.shuttingDown) {
        clearInterval(interval);
        return;
      }
      void this.autoScaler();
    }, this.queuePollInterval);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async processMessage(job: any): Promise<void> {
    const {type, ...payload} = job.data;
    await this.eventHandler.handle(type, payload, QueueType.BullMQ);
  }
}
