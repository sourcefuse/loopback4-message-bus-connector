import {
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SendMessageCommand,
  SendMessageRequest,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {BindingScope, inject, injectable} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Producer} from '../../../types';
import {SQSBindings} from '../keys';
import {Config} from '../types';
@injectable({
  scope: BindingScope.TRANSIENT,
})
export class SqsProducerService implements Producer {
  constructor(
    @inject(SQSBindings.Client)
    private readonly client: SQSClient,
    @inject(SQSBindings.Config)
    private readonly sqsConfig: Config,
    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger = console,
  ) {}

  /**
   * Sends a single message to the SQS queue.
   * @param data The message body and attributes.
   */
  async send(data: Omit<SendMessageRequest,'QueueUrl'>): Promise<void> {

      const command = new SendMessageCommand({
        ...this.sqsConfig.queueConfig,
        ...data,
      });

      const response = await this.client.send(command);
      this.logger.info('SQS send response:', JSON.stringify(response));

  }

  /**
   * Sends multiple messages to the SQS queue in batch.
   * @param data Array of messages.
   */
  async sendMultiple(data: any[]): Promise<void> {

      const entries: SendMessageBatchRequestEntry[] = data.map(
        (msg, index) => ({
          Id: msg.id ?? `msg-${index}`,
          ...msg,
        }),
      );

      const batchCommand = new SendMessageBatchCommand({
        QueueUrl: this.sqsConfig.queueConfig.QueueUrl,
        Entries: entries,
      });

      const response = await this.client.send(batchCommand);
      this.logger.info('SQS batch send response:', JSON.stringify(response));

      if (response.Failed && response.Failed.length > 0) {
        this.logger.warn(
          'Some messages failed to send:',
          JSON.stringify(response.Failed),
        );
      }
  }
}
