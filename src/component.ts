import {
  Application,
  BindingScope,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import {
  MessageBusQueueConnectorsComponentBindings,
  queueBindings,
} from './keys';
import {
  DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS,
  MessageBusQueueConnectorsComponentOptions,
  QueueConfig,
} from './types';
import {SqsProducerProvider, BullmqProducerProvider} from './providers';
import {SqsConsumerService, BullMQConsumerService} from './services';

import {BullMQObserver, SQSObserver} from './observers';

// Configure the binding for MessageBusQueueConnectorsComponent
@injectable({
  tags: {
    [ContextTags.KEY]: MessageBusQueueConnectorsComponentBindings.COMPONENT,
  },
})
export class MessageBusQueueConnectorsComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: Application,
    @config()
    private readonly options: MessageBusQueueConnectorsComponentOptions = DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS,

    @inject(queueBindings.queueConfig, {optional: true})
    private readonly queueConfig: QueueConfig,
  ) {
    //Enable generic queue start configs
    if (this.queueConfig.queueType === 'SQS') {
      this.application
        .bind('providers.QueueProducerProvider')
        .toProvider(SqsProducerProvider)
        .inScope(BindingScope.SINGLETON);

      this.application.service(SqsConsumerService);
      this.application.lifeCycleObserver(SQSObserver);
    } else if (this.queueConfig.queueType === 'BullMQ') {
      this.application
        .bind('providers.QueueProducerProvider')
        .toProvider(BullmqProducerProvider)
        .inScope(BindingScope.SINGLETON);

      this.application.service(BullMQConsumerService);

      this.application.lifeCycleObserver(BullMQObserver);
    }
  }
}
