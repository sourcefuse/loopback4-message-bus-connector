import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {EventStreamConnectorComponent} from '../../../../component';
import {
  EventBridgeConnector,
  EventBridgeStreamBindings,
} from '../../../../strategies';

export class ProducerApp extends BootMixin(ServiceMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

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
