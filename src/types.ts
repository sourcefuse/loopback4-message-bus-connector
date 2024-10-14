/**
 * Interface defining the component's options object
 */
export interface MessageBusQueueConnectorsComponentOptions {
  // Add the definitions here
}

/**
 * Default options for the component
 */
export const DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS: MessageBusQueueConnectorsComponentOptions =
  {
    // Specify the values here
  };

// Importing SqsConfig and BullMQConfig interfaces
import {SqsConfig} from './sqstypes';
import {BullMQConfig} from './bullmqtypes';

export interface Producer<Type> {
  send(opt: Type): Promise<void>;
}

export interface Consumer<T, K> {
  consumehandle(receiveOpt: T, delOpt: K): Promise<void>;
}

/**
 * consumer interface for sqs
 * */
export interface IConsumerHandler<T = QueueType, K = string, Payload = {}> {
  /**
   * handler will be called when a message is received for configured groupId and event name
   * @param payload - parsed json object from sqs message body
   * @param message - sqs message object without string body
   * */
  queueType: T;
  groupId: K;
  handler(payload: Payload): Promise<void>;
}

// Define a generic Config type
export type QueueConfig = SqsConfig | BullMQConfig;
export type QueueType = 'SQS' | 'BullMQ';
