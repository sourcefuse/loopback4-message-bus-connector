import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Job, Worker} from 'bullmq';
import {BullMQClientBindings, ConsumerExtensionPoint} from '../bullmqkeys';
import {BullMQConfig, BullMQConsumer, BullMQMessage} from '../bullmqtypes';
import {ErrorKeys} from '../error-keys';

@extensionPoint(ConsumerExtensionPoint.key)
/* BullMQConsumerService sets up a BullMQ worker to consume messages from the queue
   and dispatches them to registered consumers based on the event type. */
export class BullMQConsumerService {
  private worker: Worker | null = null;

  constructor(
    @extensions()
    private getConsumers: Getter<BullMQConsumer[]>,
    @inject(BullMQClientBindings.BullMQClient)
    private clientConfig: BullMQConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  async consume(): Promise<void> {
    const consumers = await this.getConsumers();
    const consumerMap = new Map<string, BullMQConsumer>();

    // Map consumers to their corresponding event and groupId
    for (const consumer of consumers) {
      if (!consumer.event) {
        throw new Error(
          `${ErrorKeys.ConsumerWithoutEventType}: ${JSON.stringify(consumer)}`,
        );
      }
      const key = consumer.event; //here we will be passing job name as event only.
      consumerMap.set(key, consumer);
    }

    // Initialize the worker to process jobs from the queue
    this.worker = new Worker(
      this.clientConfig.queueName,
      async (job: Job) => {
        const key = job.name;
        const consumer = consumerMap.get(key);

        if (consumer) {
          try {
            const bullMQMessage: BullMQMessage = {
              id: job.id ?? '',
              data: job.data,
              name: job.name,
            };
            await consumer.handler(job.data, bullMQMessage);
            this.logger.info(`Processed job ${job.id} for event ${job.name}`);
          } catch (error) {
            this.logger.error(
              `${ErrorKeys.ProcessingFailed}: ${JSON.stringify(error)}`,
            );
            throw error; // Re-throw to trigger BullMQ retries
          }
        } else {
          this.logger.warn(`${ErrorKeys.UnhandledEvent}: ${job.name}`);
        }
      },
      {
        connection: this.clientConfig.connection,
      },
    );

    // Job completed event listener
    this.worker.on('completed', job => {
      this.logger.info(`Job ${job.id} has been completed successfully.`);
    });

    // Job failed event listener
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed with error: ${err.message}`);
    });

    this.logger.debug('BullMQ Consumer has started.');
  }

  async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
      this.logger.debug('BullMQ Consumer has stopped.');
    }
  }
}
