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
import {SQSBindings} from './keys';
import {SQSClientProvider} from './providers';
import {Config} from './types';
import {SQSConsumerObserver} from './observers';
import {SQSConsumerService, SqsProducerService} from './services';

export class SQSConnector implements Component {
  services?: ServiceOrProviderClass[];
  providers?: ProviderMap;
  controllers?: ControllerClass[];
  lifeCycleObservers?: Constructor<LifeCycleObserver>[];
  bindings?: Binding<any>[];

  constructor(
    @inject(SQSBindings.Config, {optional: true})
    private readonly config: Config,
  ) {
    this.providers = {
      [SQSBindings.Client.key]: SQSClientProvider,
    };
    this.bindings = [
      createBindingFromClass(SqsProducerService, {
        key: SQSBindings.Producer.key,
      }),
      createBindingFromClass(SQSConsumerService),
    ];
    if (config.isConsumer) this.lifeCycleObservers = [SQSConsumerObserver];
  }
}
