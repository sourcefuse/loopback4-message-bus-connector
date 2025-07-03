import {BindingKey} from '@loopback/core';
import {Config as SQSConfig} from './types';
import {producerKeyForQueue} from '../../utils';
import {Producer, QueueType} from '../../types';
import {SQSClient} from '@aws-sdk/client-sqs';
import {EventStreamConnectorNamespace} from '../../keys';

export namespace SQSBindings {
  export const Config = BindingKey.create<SQSConfig | null>(
    'sf.queue.config.sqs',
  );

  export const Client = BindingKey.create<SQSClient>(
    `${EventStreamConnectorNamespace}.sqs.client`,
  );

  export const Producer = BindingKey.create<Producer>(
    producerKeyForQueue(QueueType.SQS),
  );
  export const SQSConsumerProvider = BindingKey.create<void>(
    'sf.queue.sqs.consumer.provider',
  );
}
