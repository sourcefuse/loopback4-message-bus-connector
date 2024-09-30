import {AnyObject} from '@loopback/repository';

import {QueueOptions, WorkerOptions} from 'bullmq';

export interface BullMQClientOptions {
  clientConfig: BullMQConfig;
  queueNames?: string[];
  initObservers?: boolean;
}

export interface BullMQConfig {
  connection: {
    host: string;
    port: number;
  };
}

export interface IStreamDefinitionBullMQ {
  queueName: string;
  messages: {};
}

export type QueueNameForStream<Stream extends IStreamDefinitionBullMQ> =
  Stream['queueName'];
export type EventsInBullMQStream<Stream extends IStreamDefinitionBullMQ> =
  keyof Stream['messages'];

export interface IConsumer<
  Stream extends IStreamDefinitionBullMQ,
  K extends EventsInBullMQStream<Stream>,
> {
  queueName: QueueNameForStream<Stream>;
  event: K;
  handler: StreamHandler<Stream, K>;
}

export interface Producer<Stream extends IStreamDefinitionBullMQ> {
  send<Type extends EventsInBullMQStream<Stream>>(
    type: Type,
    payload: Stream['messages'][Type][],
    options?: BullMQSendMessageOptions,
  ): Promise<void>;
}

export type ProducerFactoryType<Stream extends IStreamDefinitionBullMQ> = (
  groupId?: string,
) => Producer<Stream>;

export type StreamHandler<
  Stream extends IStreamDefinitionBullMQ,
  K extends EventsInBullMQStream<Stream>,
> = (payload: Stream['messages'][K]) => Promise<void>;

export interface BullMQConfig {
  initObservers: boolean;
  connection: {
    host: string;
    port: number;
  };
  queueName: string;
  queueOptions: QueueOptions;
  workerOptions: WorkerOptions;
  // groupIds?: string[];
}

export type BullMQSendMessageOptions = {
  delay?: number;
  priority?: number;
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
