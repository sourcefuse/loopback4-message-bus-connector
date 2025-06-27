import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {EventStreamConnectorComponent} from '../../../../component';
import {
  SQSBindings,
  SQSConnector,
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
    this.bind(SQSBindings.Config).to(
      {
        queueConfig: {
          QueueUrl: 'http://127.0.0.1:4566/000000000000/my-test-queue',
          MessageRetentionPeriod: 60, // at least 60 seconds
          MaximumMessageSize: 262144,
          ReceiveMessageWaitTimeSeconds: 20, // typical polling time
          VisibilityTimeout: 30, // 30 seconds
          },
          Credentials: {
            region: 'us-east-1',
            accessKeyId: 'test',
            secretAccessKey: 'test',
          },
          ConsumerConfig: {
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            maxConsumers: 2,
          },
          isConsumer:true,
      }
      
    );
    this.component(SQSConnector);

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
