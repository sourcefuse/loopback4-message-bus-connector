import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Job, Worker} from 'bullmq';
import {BullMQConsumerExtensionPoint} from '../bullmqkeys';
import {BullMQConfig, BullMQMessage} from '../bullmqtypes';
import {ErrorKeys} from '../error-keys';
import {IConsumerHandler} from '../types';
import {queueBindings} from '../keys';

@extensionPoint(BullMQConsumerExtensionPoint.key)
/* BullMQConsumerService sets up a BullMQ worker to consume messages from the queue
   and dispatches them to registered consumers based on the event type. */
export class BullMQConsumerService {
  private worker: Worker | null = null;

  constructor(
    @extensions()
    private readonly getConsumerHandlers: Getter<IConsumerHandler[]>,

    @inject(queueBindings.queueConfig, {optional: true})
    private readonly bullMQConfig: BullMQConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  async consume(): Promise<void> {
    const consumers = await this.getConsumerHandlers();
    if (!consumers || consumers.length === 0) {
      this.logger.warn(
        `No BullMQ consumers found. Please register consumers using the @bullmqConsumer decorator.`,
      );
      console.warn(
        `No BullMQ consumers found. Please register consumers using the @bullmqConsumer decorator.`,
      );
      return;
    }

    const consumerMap = new Map<string, IConsumerHandler>();

    // Map consumers to their corresponding event and groupId
    for (const consumer of consumers) {
      if (!consumer.groupId) {
        throw new Error(
          `${ErrorKeys.ConsumerWithoutGroupId}: ${JSON.stringify(consumer)}`,
        );
      }
      const key = consumer.groupId; //here we will be passing job name as event only.
      consumerMap.set(key, consumer);
    }

    // Initialize the worker to process jobs from the queue
    this.worker = new Worker(
      this.bullMQConfig.queueName,
      async (job: Job) => {
        const key = job.data.groupId; // Use the groupId as the key
        const consumer = consumerMap.get(key);

        if (consumer) {
          try {
            const bullMQMessage: BullMQMessage = {
              id: job.id ?? '',
              data: job.data.body,
              name: job.name,
            };
            await consumer.handler(bullMQMessage);
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
        connection: this.bullMQConfig.connection,
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
