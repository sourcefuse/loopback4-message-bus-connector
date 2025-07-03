import {BindingKey} from '@loopback/core';
import {
  EventBridgeClientConfig,
  EventBridgeClient,
} from '@aws-sdk/client-eventbridge';
import {Producer as ProducerType, QueueType} from '../../types';

import {EventStreamConnectorNamespace} from '../../keys';
import {producerKeyForQueue} from '../../utils';

export type EventBridgeStreamConfig = {
  source?: string;
  eventBusName?: string;
} & EventBridgeClientConfig;
export namespace EventBridgeStreamBindings {
  export const Config = BindingKey.create<EventBridgeStreamConfig>(
    `${EventStreamConnectorNamespace}.event-bridge.config`,
  );
  export const Client = BindingKey.create<EventBridgeClient>(
    `${EventStreamConnectorNamespace}.event-bridge.client`,
  );

  export const Producer = BindingKey.create<ProducerType>(
    producerKeyForQueue(QueueType.EventBridge),
  );
}
