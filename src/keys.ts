import {
  BindingKey,
  BindingTemplate,
  CoreBindings,
  extensionFor,
} from '@loopback/core';
import {EventStreamConnectorComponent} from './component';
import {EventHandlerService} from './services';
import {Producer as ProducerType} from './types';

export const EventStreamConnectorNamespace = 'event.stream.connector';
export namespace EventStreamConnectorComponentBindings {
  export const COMPONENT = BindingKey.create<EventStreamConnectorComponent>(
    `${CoreBindings.COMPONENTS}.EventStreamConnectorComponent`,
  );
  export const Producer = BindingKey.create<ProducerType>(
    `${EventStreamConnectorNamespace}.producer`,
  );
}

export const producerKey = (topic: string) =>
  BindingKey.create<ProducerType>(
    `${EventStreamConnectorNamespace}.producer.${topic}`,
  );

export const EventHandlerExtensionPoint = BindingKey.create<
  EventHandlerService<never>
>(`${EventStreamConnectorNamespace}.EventHandlerExtensionPoint`);
export const asEventHandler: BindingTemplate = binding => {
  extensionFor(EventHandlerExtensionPoint.key)(binding);
  binding.tag({namespace: EventHandlerExtensionPoint.key});
};
