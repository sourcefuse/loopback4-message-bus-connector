import {
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {inject, Provider} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {ErrorKeys} from '../error-keys';
import {queueBindings} from '../keys';
import {SqsConfig, SqsSendMessage} from '../sqstypes';
import {Producer} from '../types';

/**
 * A provider that creates a SQS producer  for sending messages to a SQS queue.
 *
 * The producer factory provides a `send` method that allows sending messages of different types to the BullMQ queue.
 * The messages are added to the queue with the specified delay and priority options.
 *
 * @param <T> The type of the SQS  definition, which defines the available message types and their payloads.
 */
export class SqsProducerProvider implements Provider<Producer<SqsSendMessage>> {
  private readonly client: SQSClient;
  constructor(
    @inject(queueBindings.queueConfig, {optional: true})
    private readonly sqsConfig: SqsConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {
    if (!this.sqsConfig) {
      this.logger.warn(`No SQS config found.`);
      console.warn(`No SQS config found.`);
      return;
    }
    this.client = new SQSClient(this.sqsConfig);
  }

  value(): Producer<SqsSendMessage> {
    return {
      send: async (options: SqsSendMessage) => {
        try {
          let groupId = options.MessageGroupId ?? this.sqsConfig.groupIds?.[0];
          if (this.sqsConfig.sqsType === 'standard') {
            groupId = undefined;
          }
          const params: SendMessageCommandInput = {
            QueueUrl: options.QueueUrl,
            MessageBody: JSON.stringify({
              groupId: options.MessageGroupId ?? this.sqsConfig.groupIds?.[0],
              data: options.body,
            }),

            MessageGroupId: groupId,
            DelaySeconds: options.DelaySeconds ?? this.sqsConfig?.DelaySeconds,

            MessageDeduplicationId: options.MessageDeduplicationId,
          };
          if (this.sqsConfig.sqsType !== 'fifo') {
            delete params.MessageGroupId;
          }
          const command = new SendMessageCommand(params);
          const result = await this.client.send(command);

          this.logger.info(`Message sent to SQS with ID: ${result.MessageId}`);
        } catch (e) {
          this.logger.error(
            `${ErrorKeys.PublishFailed}: ${e.message}`, // Log the error message
          );
          this.logger.error(e.stack); // Optionally log the stack trace for debugging
          throw e;
        }
      },
    };
  }
}
