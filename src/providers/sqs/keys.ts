import {BindingKey} from '@loopback/core';
import {Config as SQSConfig, SQSProducer} from './types';

export namespace SQSBindings {
  export const Config = BindingKey.create<SQSConfig | null>(
    'sf.queue.config.sqs',
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const SQSConsumerHandler = BindingKey.create<
    (message: any) => Promise<void>
  >('queue.sqs.consumer.handler');
  export const SQSProducerProvider = BindingKey.create<SQSProducer>(
    'sf.queue.sqs.producer.provider',
  );
  export const SQSConsumerProvider = BindingKey.create<void>(
    'sf.queue.sqs.consumer.provider',
  );
}
