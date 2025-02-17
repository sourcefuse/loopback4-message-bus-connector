import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQS,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {inject, Provider} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {SQSBindings} from './keys';
import {Config} from './types';
import {ILogger, LOGGER} from '@sourceloop/core';

/**
 * A provider that creates a SQS producer  for sending messages to a SQS queue.
 *
 * The producer factory provides a `send` method that allows sending messages of different types to the BullMQ queue.
 * The messages are added to the queue with the specified delay and priority options.
 *
 * @param <T> The type of the SQS  definition, which defines the available message types and their payloads.
 */
export class SQSConsumerProvider implements Provider<void> {
  private readonly client: SQSClient;
  private shuttingDown = false;
  constructor(
    @inject(SQSBindings.Config, {optional: true})
    private readonly sqsConfig: Config,

    @inject(SQSBindings.SQSConsumerHandler, {optional: true})
    private readonly sqsConsumerHandler: (message: Message) => Promise<void>,

    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger = console,
  ) {
    if (this.sqsConfig) {
      this.client = new SQSClient({
        region: this.sqsConfig['Credentials'].region, 
        credentials: {
          accessKeyId: this.sqsConfig['Credentials'].accessKeyId, 
          secretAccessKey: this.sqsConfig['Credentials'].secretAccessKey, 
        },
      });
    } else {
      throw new HttpErrors.PreconditionFailed('AWS SQS Config missing !');
    }
  }

  sqsService: SQS;

  value(): void {
    this.startConsumer().catch(err => {
      this.logger.error('Error starting SQS consumer:', err);
    });
  }
  public async startConsumer(): Promise<void> {
    const receiveMessages = async () => {
      if (this.shuttingDown) {
        return;
      }

      try {
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
          try {
            // Process all messages concurrently
            await Promise.all(
              response.Messages.map(async message => {
                try {
                  await this.sqsConsumerHandler(message);

                  // Delete message after successful processing
                  const deleteCommand = new DeleteMessageCommand({
                    QueueUrl: this.sqsConfig.queueConfig.QueueUrl,
                    ReceiptHandle: message.ReceiptHandle,
                  });
                  await this.client.send(deleteCommand);

                  this.logger.info(
                    'Message processed and deleted:',
                    message.MessageId,
                  );
                } catch (error) {
                  this.logger.error(
                    'Error processing message:',
                    message.MessageId,
                    error,
                  );
                }
              }),
            );
          } catch (error) {
            this.logger.error('Error processing message:', error);
          }
        } 
      } catch (error) {
        this.logger.error('Error receiving messages:', error);
      }

      // Continue receiving messages
      await receiveMessages();
    };

    // Start receiving messages
    await receiveMessages();
  }

  stop() {
    this.logger.info('Stopping SQS consumer...');
    this.shuttingDown = true;
  }
}
