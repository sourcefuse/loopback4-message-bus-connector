import {inject, Provider} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {JobsOptions, Queue} from 'bullmq';
import {BullMQConfig, BullMQSendMessage} from '../bullmqtypes';
import {ErrorKeys} from '../error-keys';
import {Producer} from '../types';
import {queueBindings} from '../keys';

/**
 * A provider that creates a BullMQ producer for sending messages to a BullMQ queue.
 *
 * The producer factory provides a `send` method that allows sending messages of different types to the BullMQ queue.
 * The messages are added to the queue with the specified delay and priority options.
 *
 * @param <T> The type of the BullMQ stream definition, which defines the available message types and their payloads.
 */
export class BullmqProducerProvider
  implements Provider<Producer<BullMQSendMessage>>
{
  private readonly queue: Queue;

  constructor(
    @inject(queueBindings.queueConfig, {optional: true})
    private readonly bullMQConfig: BullMQConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {
    if (!this.bullMQConfig) {
      this.logger.warn(`No BullMQ config found.`);
      console.warn(`No BullMQ config found.`);
      return;
    }

    this.queue = new Queue(this.bullMQConfig.queueName, {
      ...this.bullMQConfig.queueOptions,
      ...this.bullMQConfig.workerOptions,
    });
  }

  value(): Producer<BullMQSendMessage> {
    return {
      send: async (options: BullMQSendMessage) => {
        try {
          const jobOptions: JobsOptions = {
            delay: this.bullMQConfig.delay ? this.bullMQConfig.delay * 1000 : 0, // delay in seconds converted to milliseconds
            removeOnComplete: this.bullMQConfig.removeOnComplete, // optional remove completed jobs
          };

          const job = await this.queue.add(
            options.name,

            {
              groupId: options.MessageGroupId ?? this.bullMQConfig.groupId,
              body: options.body,
            },

            jobOptions,
          );

          this.logger.info(
            `Message sent to BullMQ queue with Job ID: ${job.id}`,
          );
        } catch (e) {
          this.logger.error(`${ErrorKeys.PublishFailed}: ${e.message}`);
          throw e;
        }
      },
    };
  }
}
