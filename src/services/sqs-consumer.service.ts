import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {ErrorKeys} from '../error-keys';
import {ConsumerExtensionPoint, SqsClientBindings} from '../sqskeys';
import {SqsConfig, SqsConsumer} from '../sqstypes';

@extensionPoint(ConsumerExtensionPoint.key)
/* It creates an SQS consumer client, polls messages from the queue,
and processes them using registered consumers */
export class SqsConsumerService {
  private isPolling = true;

  constructor(
    @extensions()
    private getConsumers: Getter<SqsConsumer[]>,
    @inject(SqsClientBindings.SqsClient)
    private clientConfig: SqsConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    private clientsqs = new SQSClient({}),
  ) {}

  async consume(): Promise<void> {
    const consumers = await this.getConsumers();
    const consumerMap = new Map<string, SqsConsumer>();

    for (const consumer of consumers) {
      if (!consumer.event) {
        throw new Error(
          `${ErrorKeys.ConsumerWithoutEventType}: ${JSON.stringify(consumer)}`,
        );
      }
      const key = this.getKey(consumer.event, consumer.groupId);
      consumerMap.set(key, consumer);
    }

    // eslint-disable-next-line no-void
    void this.pollMessages(consumerMap);
  }

  private async pollMessages(
    consumerMap: Map<string, SqsConsumer>,
  ): Promise<void> {
    while (this.isPolling) {
      try {
        const data = await this.clientsqs.send(
          new ReceiveMessageCommand({
            QueueUrl: this.clientConfig.queueUrl,
            MaxNumberOfMessages: this.clientConfig.maxNumberOfMessages, // Adjust based on your needs
            WaitTimeSeconds: this.clientConfig.waitTimeSeconds,
          }),
        );

        if (data.Messages) {
          const messagePromises = data.Messages.map(
            async (message: Message) => {
              if (message.Body) {
                const parsedMessage = JSON.parse(message.Body);
                const key = this.getKey(
                  parsedMessage.event,
                  message.Attributes?.MessageGroupId,
                );

                const consumer = consumerMap.get(key);
                if (consumer) {
                  await consumer.handler(parsedMessage.data, {
                    ...message,
                  });
                  // Delete the message after successful processing
                  await this.clientsqs.send(
                    new DeleteMessageCommand({
                      QueueUrl: this.clientConfig.queueUrl,
                      ReceiptHandle: message.ReceiptHandle,
                    }),
                  );
                } else {
                  this.logger.warn(
                    `${ErrorKeys.UnhandledEvent}: ${JSON.stringify(message)}`,
                  );
                }
              }
            },
          );

          // Process all messages concurrently
          await Promise.all(messagePromises);
        }
      } catch (e) {
        this.logger.error(`${ErrorKeys.PollingFailed}: ${JSON.stringify(e)}`);
      }
    }
  }

  async stop() {
    this.isPolling = false;
  }

  private getKey(event: string, groupId?: string): string {
    if (this.clientConfig.queueType === 'standard') {
      return `${String(event)}`;
    }
    return `${groupId}.${String(event)}`;
  }
}
