import {BindingKey, BindingTemplate, extensionFor} from '@loopback/core';
import {SqsConsumerService} from './services';

export const SQSQueueNamespace = 'arc.queue';

export const SqsConsumerExtensionPoint = BindingKey.create<SqsConsumerService>(
  `${SQSQueueNamespace}.SqsConsumerExtensionPoint`,
);

export const SQSConsumerHandler: BindingTemplate = binding => {
  extensionFor(SqsConsumerExtensionPoint.key)(binding);
  binding.tag({namespace: SqsConsumerExtensionPoint.key});
};
