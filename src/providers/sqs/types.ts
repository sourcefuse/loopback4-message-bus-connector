import {SendMessageCommandInput} from '@aws-sdk/client-sqs';
import {IQueueProducer, Message} from '../../types';

export interface SQSProducer extends IQueueProducer {
  send(message: SQSSendMessage): Promise<void>;
}

export interface SQSSendMessage extends Message {
  message: Omit<SendMessageCommandInput, 'QueueUrl'>;
}

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
}
