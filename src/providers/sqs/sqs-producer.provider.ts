import {SendMessageCommand, SQS, SQSClient} from '@aws-sdk/client-sqs';
import {inject, Provider} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {SQSBindings} from './keys';
import {SQSProducer, SQSSendMessage, Config} from './types';
import {ILogger, LOGGER} from '@sourceloop/core';

/**
 * A provider that creates a SQS producer  for sending messages to a SQS queue.
 *
 * The producer factory provides a `send` method that allows sending messages of different types to the BullMQ queue.
 * The messages are added to the queue with the specified delay and priority options.
 *
 * @param <T> The type of the SQS  definition, which defines the available message types and their payloads.
 */
export class SqsProducerProvider implements Provider<SQSProducer> {
  private readonly client: SQSClient;
  constructor(
    @inject(SQSBindings.Config)
    private readonly sqsConfig: Config,
    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger = console,
  ) {
    if (this.sqsConfig) {
      this.client = new SQSClient({
        region: this.sqsConfig['Credentials'].region, // Replace with your AWS region
        credentials: {
          accessKeyId: this.sqsConfig['Credentials'].accessKeyId, // Replace with your Access Key
          secretAccessKey: this.sqsConfig['Credentials'].secretAccessKey, // Replace with your Secret Key
        },
      });
    } else {
      throw new HttpErrors.PreconditionFailed('AWS SQS Config missing !');
    }
  }

  sqsService: SQS;

  value(): SQSProducer {
    return {
      send: async (message: SQSSendMessage): Promise<void> => {
        try {
          const command = new SendMessageCommand({
            ...this.sqsConfig.queueConfig,
            ...message.message,
          });
          const response = await this.client.send(command);
          this.logger.info('response: ', JSON.stringify(response));
        } catch (error) {
          this.logger.error('Error in SQS producer:', error);
        }
      },
    };
  }
}
