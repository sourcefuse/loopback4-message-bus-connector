import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {BindingScope, inject, injectable, service} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {EventHandlerService} from '../../../services';
import {QueueType} from '../../../types';
import {SQSBindings} from '../keys';
import {Config} from '../types';

@injectable({
  scope: BindingScope.TRANSIENT,
})
export class SQSConsumerService {
  private shuttingDown = false;

  constructor(
    @inject(SQSBindings.Config, {optional: true})
    private readonly sqsConfig: Config,
    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger = console,
    @service(EventHandlerService)
    private eventHandler: EventHandlerService,
    @inject(SQSBindings.Client)
    private readonly client: SQSClient,
  ) {}

  /**
   * Starts the SQS consumer to poll and handle messages.
   */
  public async startConsumer(): Promise<void> {
    const receiveMessages = async () => {
      if (this.shuttingDown) {
        return;
      }

      const command = new ReceiveMessageCommand({
        AttributeNames: ['All'],
        MaxNumberOfMessages:
          this.sqsConfig.ConsumerConfig?.MaxNumberOfMessages ?? 10,
        MessageAttributeNames: ['All'],
        QueueUrl: this.sqsConfig.queueConfig.QueueUrl,
        WaitTimeSeconds: this.sqsConfig.ConsumerConfig?.WaitTimeSeconds,
      });

      const response = await this.client.send(command);

      if (response.Messages && response.Messages.length > 0) {
        await Promise.all(
          response.Messages.map(async message => {
            const {Body, MessageAttributes, MessageId} = message;

            if (!Body) throw new Error('Message body is undefined');

            const parsedBody = JSON.parse(Body);
            const eventType = MessageAttributes?.EventType?.StringValue;

            if (!eventType) {
              this.logger.warn(
                `Event type is undefined for message: ${MessageId}`,
              );
              return;
            }

            await this.eventHandler.handle(
              eventType,
              parsedBody,
              QueueType.SQS,
            );

            const deleteCommand = new DeleteMessageCommand({
              QueueUrl: this.sqsConfig.queueConfig.QueueUrl,
              ReceiptHandle: message.ReceiptHandle,
            });
            await this.client.send(deleteCommand);

            this.logger.info(
              'Message processed and deleted:',
              message.MessageId,
            );
          }),
        );
      }

      await receiveMessages(); // Keep polling
    };

    await receiveMessages();
  }

  /**
   * Stops the SQS consumer loop.
   */
  public stop(): void {
    this.logger.info('Stopping SQS consumer...');
    this.shuttingDown = true;
  }
}
