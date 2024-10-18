import {BindingKey, BindingTemplate, extensionFor} from '@loopback/core';

import {BullMQConsumerService} from './services';

export const BullMQQueueNamespace = 'arc.queue';

export const BullMQConsumerExtensionPoint =
  BindingKey.create<BullMQConsumerService>(
    `${BullMQQueueNamespace}.BullMQConsumerExtensionPoint`,
  );

export const BullMQConsumerHandler: BindingTemplate = binding => {
  extensionFor(BullMQConsumerExtensionPoint.key)(binding);
  binding.tag({namespace: BullMQConsumerExtensionPoint.key});
};
