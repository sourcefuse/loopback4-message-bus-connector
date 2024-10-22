import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {ErrorKeys} from '../error-keys';
import {queueBindings} from '../keys';
import {SqsConsumerExtensionPoint} from '../sqskeys';
import {SqsConfig} from '../sqstypes';
import {IConsumerHandler} from '../types';

@extensionPoint(SqsConsumerExtensionPoint.key)
/* It creates an SQS consumer client, polls messages from the queue,
and processes them using registered consumers */
export class SqsConsumerService {
  private readonly client: SQSClient;
  private isPolling = true;
  constructor(
    @extensions()
    private readonly getConsumerHandlers: Getter<IConsumerHandler[]>,
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

  async consume(): Promise<void> {
    const consumers = await this.getConsumerHandlers();

    if (!consumers || consumers.length === 0) {
      this.logger.warn(
        `No SQS consumers found. Please register consumers using the @bullmqConsumer decorator.`,
      );
      console.warn(
        `No SQS consumers found. Please register consumers using the @bullmqConsumer decorator.`,
      );
      return;
    }
    const consumerMap = new Map<string, IConsumerHandler>();

    for (const consumer of consumers) {
      if (!consumer.groupId) {
        throw new Error(
          `${ErrorKeys.ConsumerWithoutGroupId}: ${JSON.stringify(consumer)}`,
        );
      }
      // const key = this.getKey(consumer.event, consumer.groupId);
      const key = consumer.groupId;
      consumerMap.set(key, consumer);
    }

    this.sqsConfig.queueUrls.forEach(queueUrl =>
      this.pollMessages(queueUrl, consumerMap),
    );
  }

  private async pollMessages(
    queueUrl: string,
    consumerMap: Map<string, IConsumerHandler>,
  ): Promise<void> {
    while (this.isPolling) {
      try {
        const data = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: this.sqsConfig.maxNumberOfMessages, // Adjust based on your needs
            WaitTimeSeconds: this.sqsConfig.waitTimeSeconds,
          }),
        );

        if (data.Messages) {
          const messagePromises = data.Messages.map(
            async (message: Message) => {
              if (message.Body) {
                const parsedMessage = JSON.parse(message.Body);

                const key = parsedMessage.groupId;
                const consumerObj = consumerMap.get(key);

                if (consumerObj) {
                  await consumerObj.handler(parsedMessage.data);
                  // Delete the message after successful processing
                  await this.client.send(
                    new DeleteMessageCommand({
                      QueueUrl: queueUrl,
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
}
