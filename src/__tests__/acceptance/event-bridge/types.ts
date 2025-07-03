import {EventBridgeClient} from '@aws-sdk/client-eventbridge';
import {AnyObject} from '@loopback/repository';

export type StubListener = (
  topic: string,
  source: string,
  data: AnyObject,
) => void;

export type EventBridgeStub = {
  send: EventBridgeClient['send'];
  register: (listener: StubListener) => void;
};
