import {BindingKey, CoreBindings} from '@loopback/core';
import {MessageBusQueueConnectorsComponent} from './component';
import {BullmqProducerProvider, SqsProducerProvider} from './providers';
import {QueueConfig} from './types';

/**
 * Binding keys used by this component.
 */
export namespace MessageBusQueueConnectorsComponentBindings {
  export const COMPONENT =
    BindingKey.create<MessageBusQueueConnectorsComponent>(
      `${CoreBindings.COMPONENTS}.MessageBusQueueConnectorsComponent`,
    );
}
export const QueueNamespace = 'arc.queue';
export namespace queueBindings {
  export const Component =
    BindingKey.create<MessageBusQueueConnectorsComponent>(
      `${QueueNamespace}.MessageBusQueueConnectorsComponent`,
    );

  export const queueConfig = BindingKey.create<QueueConfig>(
    `${QueueNamespace}.QueueConfig`,
  );
}

export const queueConfigProducerProvider = BindingKey.create<
  SqsProducerProvider | BullmqProducerProvider
>('providers.QueueProducerProvider');

