import {BindingKey, BindingTemplate, extensionFor} from '@loopback/core';
import {QueueOptions, WorkerOptions} from 'bullmq';
import {
  BullMQConfig,
  IStreamDefinitionBullMQ,
  Producer,
  ProducerFactoryType,
  StreamHandler,
} from './bullmqtypes';
import {MessageBusQueueConnectorsComponent} from './component';
import {BullMQConsumerService} from './services';

/**
 * The namespace for all BullMQ-related bindings and configuration.
 */
export const QueueNamespace = 'arc.queue.bullmq';

export namespace BullMQClientBindings {
  export const Component =
    BindingKey.create<MessageBusQueueConnectorsComponent>(
      `${QueueNamespace}.MessageBusQueueConnectorsComponent`,
    );
  export const ConsumerService = BindingKey.create<BullMQConsumerService>(
    `${QueueNamespace}.BullMQConsumerService`,
  );
  export const BullMQClient = BindingKey.create<BullMQConfig>(
    `${QueueNamespace}.BullMQClient`,
  );

  export const BullMQQueueOptions = BindingKey.create<QueueOptions>(
    `${QueueNamespace}.BullMQQueueOptions`,
  );

  export const BullMQWorkerOptions = BindingKey.create<WorkerOptions>(
    `${QueueNamespace}.BullMQWorkerOptions`,
  );

  export const ProducerFactory = BindingKey.create<
    ProducerFactoryType<IStreamDefinitionBullMQ>
  >(`${QueueNamespace}.ProducerFactory`);

  export const LifeCycleGroup = `${QueueNamespace}.BULLMQ_OBSERVER_GROUP`;
}

export const producerKey = (groupId?: string) => {
  return BindingKey.create<Producer<IStreamDefinitionBullMQ>>(
    `${QueueNamespace}.producer.${groupId}`,
  );
};

export const eventHandlerKey = <
  Stream extends IStreamDefinitionBullMQ,
  K extends keyof Stream['messages'],
>(
  event: K,
) =>
  BindingKey.create<StreamHandler<Stream, K>>(
    `${QueueNamespace}.eventhandler.${event as string}`,
  );

export const ConsumerExtensionPoint = BindingKey.create<BullMQConsumerService>(
  `${QueueNamespace}.ConsumerExtensionPoint`,
);

export const asConsumer: BindingTemplate = binding => {
  extensionFor(ConsumerExtensionPoint.key)(binding);
  binding.tag({namespace: ConsumerExtensionPoint.key});
};
