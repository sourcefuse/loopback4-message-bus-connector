import {AnyObject} from '@loopback/repository';

export interface IConsumer<
  Stream extends AnyObject,
  Event extends keyof Stream,
> {
  event: Event;
  queue: QueueType;
  handle(data: Stream[Event]): Promise<void>;
}

export type MessageOptions = AnyObject;
//---end new changes---------------------------
/**
 * Interface defining the component's options object
 */

/**
 * Interface defining the component's options object
 */
export interface EventStreamConnectorComponentOptions {
  producersFor?: string[];
}

/**
 * Default options for the component
 */
export const DEFAULT_EVENT_STREAM_CONNECTOR_OPTIONS: EventStreamConnectorComponentOptions =
  {
    // Specify the values here
  };

export type Producer<Stream extends AnyObject = AnyObject> = {
  send: <Event extends keyof Stream>(
    data: Stream[Event],
    topic?: Event,
  ) => Promise<void>;
  sendMultiple: <Event extends keyof Stream>(
    data: Stream[Event][],
    topic?: Event,
  ) => Promise<void>;
};

export interface IConsumer<
  Stream extends AnyObject,
  Event extends keyof Stream,
> {
  event: Event;
  queue: QueueType;
  handle(data: Stream[Event]): Promise<void>;
}

export enum QueueType {
  SQS,
  BullMQ,
  EventBridge,
}
