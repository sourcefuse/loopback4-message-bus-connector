import {JobsOptions} from 'bullmq';
import {IQueueProducer, Message} from '../../types';
export interface BullMQProducer extends IQueueProducer {
  send(message: BullMQSendMessage): Promise<void>;
}

export interface BullMQSendMessage extends Message {
  message: {
    name: string; // Job name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any; // Payload for the job
    options?: JobsOptions; // Options such as delay, attempts, priority, etc.
  };
}

// Consumer Configuration
export interface BullMQConsumerConfig {
  MaxConsumers?: number; // Maximum number of workers for autoscaling
  MinConsumers?: number; // Minimum number of workers for autoscaling
  QueuePollInterval?: number; // Interval for polling the queue for new messages
}

// Message Processor Interface
export interface BullMQMessageProcessor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(jobData: any): Promise<void>;
}

// BullMQ Configuration
export interface Config {
  QueueName: string;
  producerConfig?: {
    defaultJobOptions?: JobsOptions; // Default options for all jobs
  };
  consumerConfig?: BullMQConsumerConfig;
  redisConfig: {
    host: string;
    port: number;
    password?: string;
  };
}
