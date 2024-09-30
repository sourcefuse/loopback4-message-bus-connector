import {inject, Provider} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {JobsOptions, Queue} from 'bullmq';
import {BullMQClientBindings} from '../bullmqkeys';
import {
  BullMQConfig,
  BullMQSendMessageOptions,
  IStreamDefinitionBullMQ,
  ProducerFactoryType,
} from '../bullmqtypes';
import {ErrorKeys} from '../error-keys';

/**
 * A provider that creates a BullMQ producer factory for sending messages to a BullMQ queue.
 *
 * The producer factory provides a `send` method that allows sending messages of different types to the BullMQ queue.
 * The messages are added to the queue with the specified delay and priority options.
 *
 * @param <T> The type of the BullMQ stream definition, which defines the available message types and their payloads.
 */
export class BullmqProducerFactoryProvider<T extends IStreamDefinitionBullMQ>
  implements Provider<ProducerFactoryType<T>>
{
  private queue: Queue;

  constructor(
    @inject(BullMQClientBindings.BullMQClient)
    private client: BullMQConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {
    this.queue = new Queue(this.client.queueName, {
      ...this.client.queueOptions,
    });
  }

  value(): ProducerFactoryType<T> {
    return () => {
      return {
        send: async <Type extends keyof T['messages']>(
          type: Type,
          payload: T['messages'][Type][],
          options: BullMQSendMessageOptions = {},
        ): Promise<void> => {
          try {
            await Promise.all(
              payload.map(async message => {
                const jobOptions: JobsOptions = {
                  delay: options.delay ? options.delay * 1000 : 0, // delay in seconds converted to milliseconds
                  removeOnComplete: true, // optional remove completed jobs
                  priority: options.priority,
                };

                const job = await this.queue.add(
                  type as string, // BullMQ expects the name of the job as a string
                  {event: type, data: message},
                  jobOptions,
                );

                this.logger.info(
                  `Message sent to BullMQ queue with Job ID: ${job.id}`,
                );
              }),
            );
          } catch (e) {
            this.logger.error(`${ErrorKeys.PublishFailed}: ${e.message}`);
            throw e;
          }
        },
      };
    };
  }

  async produce(
    type: string,
    payload: {data: string}[],
    options: {delay: number; priority: number},
  ) {
    throw new Error('Method not implemented.');
  }
}
