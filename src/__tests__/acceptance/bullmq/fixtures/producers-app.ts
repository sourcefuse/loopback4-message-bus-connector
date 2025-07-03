import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {EventStreamConnectorComponent} from '../../../../component';
import {BullMQBindings, BullMQConnector} from '../../../../strategies';

export class ProducerApp extends BootMixin(ServiceMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.component(EventStreamConnectorComponent);
    this.bind(BullMQBindings.Config).to({
      QueueName: process.env.QUEUE_NAME ?? 'default-queue',
      redisConfig: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD ?? undefined,
      },
      producerConfig: {
        defaultJobOptions: {
          attempts: 3,
          backoff: 5000,
        },
      },
      consumerConfig: {
        MinConsumers: 1,
        MaxConsumers: 5,
        QueuePollInterval: 2000,
      },
    });
    // Bind your message handler
    this.component(BullMQConnector);

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
