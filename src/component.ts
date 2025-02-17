import {QueueBindings} from './keys';

import {SQSBindings} from './providers/sqs/keys';
import {QueueProducerProvider} from './providers/queue-producer-provider';
import {Binding, Component, ProviderMap} from '@loopback/core';
import {BullMQBindings} from './providers/bullmq';

export class MessageBusQueueConnectorsComponent implements Component {
  constructor() {
    // Intentionally left empty
  }

  providers?: ProviderMap = {
    [QueueBindings.ProducerProvider.key]: QueueProducerProvider,
  };

  bindings?: Binding[] = [
    Binding.bind(SQSBindings.Config.key).to(null),
    Binding.bind(BullMQBindings.Config.key).to(null),
  ];
}
