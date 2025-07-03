import {
  EventBridgeClient,
  EventBridgeClientConfig,
} from '@aws-sdk/client-eventbridge';
import {inject, Provider} from '@loopback/core';
import {EventBridgeStreamBindings} from '../keys';

export class EventBridgeClientProvider implements Provider<EventBridgeClient> {
  constructor(
    @inject(EventBridgeStreamBindings.Config, {optional: true})
    private readonly config: EventBridgeClientConfig = {},
  ) {}
  value() {
    return new EventBridgeClient(this.config);
  }
}
