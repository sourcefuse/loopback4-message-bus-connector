import {AnyObject} from '@loopback/repository';
import {injectable} from '@loopback/core';
import {IConsumer} from '../types';
import {asEventHandler} from '../keys';

export function consumer<
  Stream extends AnyObject,
  Event extends keyof Stream,
  T extends abstract new (
    ...args: ConstructorParameters<T>
  ) => IConsumer<Stream, Event>,
>(target: T) {
  return injectable(asEventHandler)(target);
}
