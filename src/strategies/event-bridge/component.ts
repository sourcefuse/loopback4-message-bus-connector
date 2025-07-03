import {
  Component,
  ProviderMap,
  ServiceOrProviderClass,
  ControllerClass,
  Binding,
  createBindingFromClass,
} from '@loopback/core';
import {EventBridgeStreamBindings} from './keys';
import {EventBridgeClientProvider} from './providers';
import {EventController} from './controllers';
import {EventBridgeProducerService} from './services';

export class EventBridgeConnector implements Component {
  services?: ServiceOrProviderClass[];
  providers?: ProviderMap;
  controllers?: ControllerClass[];
  bindings?: Binding[];

  constructor() {
    this.bindings = [
      createBindingFromClass(EventBridgeProducerService, {
        key: EventBridgeStreamBindings.Producer.key,
      }),
    ];
    this.providers = {
      [EventBridgeStreamBindings.Client.key]: EventBridgeClientProvider,
    };

    this.controllers = [EventController];
  }
}
