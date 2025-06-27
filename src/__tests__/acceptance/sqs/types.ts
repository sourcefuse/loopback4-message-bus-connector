import {AnyObject} from '@loopback/repository';

export type StubListener = (
  topic: string,
  source: string,
  data: AnyObject,
) => void;
