import {inject, Provider} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {Queue} from 'bullmq';
import {BullMQBindings} from './keys';
import {BullMQProducer, BullMQSendMessage, Config} from './types';
import {ILogger, LOGGER} from '@sourceloop/core';
/**
 * A provider that creates a SQS producer  for sending messages to a SQS queue.
 *
 * The producer factory provides a `send` method that allows sending messages of different types to the BullMQ queue.
 * The messages are added to the queue with the specified delay and priority options.
 *
 * @param <T> The type of the SQS  definition, which defines the available message types and their payloads.
 */
export class BullMQProducerProvider implements Provider<BullMQProducer> {
  private readonly queue: Queue;

  constructor(
    @inject(BullMQBindings.Config)
    private readonly bullConfig: Config,
    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger,
  ) {
    if (!this.bullConfig?.QueueName) {
      throw new HttpErrors.PreconditionFailed(
        'BullMQ Config missing or invalid!',
      );
    }
    // Initialize the BullMQ queue
    this.queue = new Queue(this.bullConfig.QueueName, {
      connection: this.bullConfig.redisConfig,

      ...this.bullConfig.producerConfig?.defaultJobOptions,
    });
  }

  value(): BullMQProducer {
    return {
      send: async (message: BullMQSendMessage): Promise<void> => {
        try {
          // Add the message to the BullMQ queue
          await this.queue.add(
            message.message.name,
            message.message.data,
            message.message.options,
          );
        } catch (error) {
          this.logger.error('Error in BullMQ producer:', error);
          throw error;
        }
      },
    };
  }
}
