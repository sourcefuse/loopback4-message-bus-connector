// import { SQSConsumerHandler } from '@sourceloop/queue';
// import {SQSClientConfig} from '@aws-sdk/client-sqs';
import {BindingKey} from '@loopback/core';
import {Config as BullMQConfig, BullMQProducer} from './types';
// import { BullMQProducer } from './types';
import {Queue} from 'bullmq';

export namespace BullMQBindings {
  export const Config = BindingKey.create<BullMQConfig | null>(
    'sf.queue.config.bullmq',
  );

  export const BullMQQueue = BindingKey.create<Queue | null>(
    'sf.queue.bullmq.queue',
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const BullMQConsumerHandler = BindingKey.create<
    (message: any) => Promise<void>
  >('queue.bullmq.consumer.handler');
  export const BullMQProducerProvider = BindingKey.create<BullMQProducer>(
    'sf.queue.bullmq.producer.provider',
  );
  export const BullMQConsumerProvider = BindingKey.create<void>(
    'sf.queue.bullmq.consumer.provider',
  );
}
