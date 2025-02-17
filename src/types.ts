import {AnyObject} from '@loopback/repository';
//----start new changes---------------------------
export interface IQueueProducer {
  send(message: Message): Promise<void>;
}

export const enum QueueType {
  SQS,
  BullMQ,
}

// export interface Message {
//   subject?: string;
//   body: string;
//   receiver: Receiver;
//   sentDate: Date;
//   type: MessageType;
//   options?: MessageOptions;
// }

export interface Message {
  // subject?: string;
  // body: string;
  // receiver: Receiver;
  // sentDate: Date;
  message: AnyObject;
  type?: QueueType;
  options?: MessageOptions;
}

// export interface Config {
//   // receiver: Receiver;
//   type: QueueType;
//   queueUrl: string;
//   // options?: MessageOptions;
// }

export type MessageOptions = AnyObject;
//---end new changes---------------------------
/**
 * Interface defining the component's options object
 */
