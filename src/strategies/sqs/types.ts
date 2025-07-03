import {SendMessageBatchRequestEntry} from '@aws-sdk/client-sqs';

export interface Config {
  queueConfig: {
    QueueUrl: string;
    FifoQueue?: boolean;
    DelaySeconds?: number;
    MessageRetentionPeriod?: number;
    MaximumMessageSize?: number;
    ReceiveMessageWaitTimeSeconds?: number;

    VisibilityTimeout?: number;
    RedrivePolicy?: string;

    deadLetterTargetArn?: string;
    MessageGroupId?: string;
    MessageDeduplicationId?: string;
    ContentBasedDeduplication?: boolean;
  };

  Credentials: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  ConsumerConfig: {
    MaxNumberOfMessages: number;
    WaitTimeSeconds: number;
    maxConsumers?: number;
  };
  isConsumer?: boolean;
}

export type PartialSendMessageBatchRequestEntry = Omit<
  SendMessageBatchRequestEntry,
  'Id'
> & {id?: string};
