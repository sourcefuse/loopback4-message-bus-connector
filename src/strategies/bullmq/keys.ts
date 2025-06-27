import {BindingKey} from '@loopback/core';
import {BullMQConfig} from './types';
import {Queue} from 'bullmq';
import {producerKeyForQueue} from '../../utils';
import {Producer, QueueType} from '../../types';

export namespace BullMQBindings {
  export const Config = BindingKey.create<BullMQConfig | null>(
    'sf.queue.config.bullmq',
  );

  export const BullMQQueue = BindingKey.create<Queue | null>(
    'sf.queue.bullmq.queue',
  );

  export const BullMQProducerProvider = BindingKey.create<Producer>(
    producerKeyForQueue(QueueType.BullMQ),
  );
  export const BullMQConsumer = BindingKey.create<void>(
    'sf.queue.bullmq.consumer.provider',
  );
}
