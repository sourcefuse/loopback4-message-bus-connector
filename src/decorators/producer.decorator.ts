import {inject} from '@loopback/core';
import {queueConfigProducerProvider} from '../keys';
/**
 * Get producer for the particular group id and queue type
 * @param queueType - 'sqs' or 'bullmq'
 * @param groupId
 */
import {SqsProducerProvider} from '../providers/sqs-producer.provider';

import {BullmqProducerProvider} from '../providers';
export function producer(queueType: string = 'SQS') {
  switch (queueType) {
    case 'SQS':
      return inject(queueConfigProducerProvider, {
        resolver: SqsProducerProvider,
        optional: true,
      });
    case 'BullMQ':
      return inject(queueConfigProducerProvider, {
        resolver: BullmqProducerProvider,
        optional: true,
      });
    default:
      return inject('', {optional: true});
  }
}
