import {inject} from '@loopback/core';
import {QueueType} from '../types';
import {producerKeyForQueue} from '../utils';

export function producer(queue: QueueType) {
  return inject(producerKeyForQueue(queue));
}
