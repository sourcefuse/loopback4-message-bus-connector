import {
  Binding,
  Component,
  Constructor,
  ControllerClass,
  createBindingFromClass,
  inject,
  LifeCycleObserver,
  ProviderMap,
  ServiceOrProviderClass,
} from '@loopback/core';
import {BullMQBindings} from './keys';
import {BullMQConfig} from './types';
import {BullMQConsumerObserver} from './observers/bullmq-consumer.observer';
import {BullMQQueueProvider} from './providers';
import {BullMQConsumerService, BullMQProducerService} from './services';

export class BullMQConnector implements Component {
  services?: ServiceOrProviderClass[];
  providers?: ProviderMap;
  controllers?: ControllerClass[];
  bindings?: Binding<any>[] | undefined;
  lifeCycleObservers?: Constructor<LifeCycleObserver>[] | undefined;
  constructor(
    @inject(BullMQBindings.Config, {optional: true})
    private readonly config: BullMQConfig,
  ) {
    this.providers = {
      [BullMQBindings.BullMQQueue.key]: BullMQQueueProvider,
    };
    this.bindings = [
      createBindingFromClass(BullMQProducerService, {
        key: BullMQBindings.BullMQProducerProvider.key,
      }),
      createBindingFromClass(BullMQConsumerService, {
        key: BullMQBindings.BullMQConsumer.key,
      }),
    ];
    if (config.isConsumer) this.lifeCycleObservers = [BullMQConsumerObserver];
  }
}
