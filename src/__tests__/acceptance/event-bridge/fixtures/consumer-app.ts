import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {EventStreamConnectorComponent} from '../../../../component';
import {
  EventBridgeConnector,
  EventBridgeStreamBindings,
} from '../../../../strategies';
import {EventAConsumer} from './services/event-a.consumer';
import {EventBConsumer} from './services/event-b.consumer';
import {EventBSecondConsumer} from './services/event-b-second.consumer';

export class ConsumerApp extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.service(EventAConsumer);
    this.service(EventBConsumer);
    this.service(EventBSecondConsumer);
    this.component(EventStreamConnectorComponent);
    this.bind(EventBridgeStreamBindings.Config).to({});
    this.component(EventBridgeConnector);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
