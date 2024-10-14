// import { BullMQClient } from './bullmqkeys';
import {AnyObject} from '@loopback/repository';

import {QueueOptions, WorkerOptions} from 'bullmq';

export interface BullMQClientOptions {
  clientConfig: BullMQConfig;
  queueNames?: string[];
  initObservers?: boolean;
}

export type BullMQSendMessageOptions = {
  delay?: number;
  // priority?: number;
};

export interface BullMQMessage {
  id: string;
  name: string;
  data: AnyObject;
}

export interface BullMQConsumer<Payload = {}> {
  event: string;
  handler(payload: Payload, message: BullMQMessage): Promise<void>;
}
//=================================================================================
//BullMQ connector
export interface BullMQClientConfig {
  host: string;
  port: number;
}

//SQS config
export interface BullMQConfig {
  queueType: 'BullMQ';
  initObservers: boolean;
  connection: BullMQClientConfig;
  queueOptions: QueueOptions;
  workerOptions: WorkerOptions;
  delay: number;
  removeOnComplete: boolean;
  groupId: string;
  queueName: string;
}

//For sending message to sqs
export interface BullMQSendMessage<T = string> {
  id?: string;
  name: string;
  delay?: number;
  body: T;

  MessageGroupId?: string;
}
