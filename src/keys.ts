import {BindingKey} from '@loopback/core';
import {IQueueProducer} from './types';
import {SQSProducer} from './providers/sqs/types';
import {BullMQProducer} from './providers/bullmq/types';

export namespace QueueBindings {
  export const ProducerProvider =
    BindingKey.create<IQueueProducer>('sf.queueproducer');
  export const SQSProducerProvider = BindingKey.create<SQSProducer>(
    'sf.queueproducer.sqs',
  );
  export const BullMQProducerProvider = BindingKey.create<BullMQProducer>(
    'sf.queueproducer.bullmq',
  );
}
