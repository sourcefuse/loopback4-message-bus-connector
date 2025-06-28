import {AnyObject} from '@loopback/repository';

export type StubListener = (
  topic: string,
  source: string,
  data: AnyObject,
) => void;

export interface BullMqQueueParams {
  name: string;
  data: Record<string, unknown>;
  options?: {
    delay?: number;
    priority?: number;
    [key: string]: unknown;
  };
}
