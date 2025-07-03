import {
  Application,
  injectable,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  ServiceOrProviderClass,
} from '@loopback/core';
import {EventStreamConnectorComponentBindings} from './keys';
import {LoggerExtensionComponent} from '@sourceloop/core';
import {
  DEFAULT_EVENT_STREAM_CONNECTOR_OPTIONS,
  EventStreamConnectorComponentOptions,
} from './types';
import {EventHandlerService} from './services';

// Configure the binding for EventStreamConnectorComponent
@injectable({
  tags: {[ContextTags.KEY]: EventStreamConnectorComponentBindings.COMPONENT},
})
export class EventStreamConnectorComponent implements Component {
  services?: ServiceOrProviderClass[];
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application,
    @config()
    private options: EventStreamConnectorComponentOptions = DEFAULT_EVENT_STREAM_CONNECTOR_OPTIONS,
  ) {
    app.component(LoggerExtensionComponent);

    this.services = [EventHandlerService];
  }
}
