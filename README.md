<a href="https://sourcefuse.github.io/arc-docs/arc-api-docs" target="_blank"><img src="https://github.com/sourcefuse/loopback4-microservice-catalog/blob/master/docs/assets/logo-dark-bg.png?raw=true" alt="ARC By SourceFuse logo" title="ARC By SourceFuse" align="right" width="150" /></a>

# [loopback4-message-queue-connector](https://github.com/sourcefuse/loopback4-message-queue-connector)

<p align="left">
<a href="https://www.npmjs.com/package/loopback4-message-queue-connector">
<img src="https://img.shields.io/npm/v/loopback4-message-queue-connector.svg" alt="npm version" />
</a>
<a href="https://sonarcloud.io/summary/new_code?id=sourcefuse_loopback4-message-queue-connector" target="_blank">
<img alt="Sonar Quality Gate" src="https://img.shields.io/sonar/quality_gate/sourcefuse_loopback4-message-queue-connector?server=https%3A%2F%2Fsonarcloud.io">
</a>
<a href="https://app.snyk.io/org/ashishkaushik/reporting?context[page]=issues-detail&project_target=%255B%2522sourcefuse%252Floopback4-message-queue-connector%2522%255D&project_origin=%255B%2522github%2522%255D&issue_status=%255B%2522Open%2522%255D&issue_by=Severity&table_issues_detail_cols=SCORE%257CCVE%257CCWE%257CPROJECT%257CEXPLOIT%2520MATURITY%257CAUTO%2520FIXABLE%257CINTRODUCED%257CSNYK%2520PRODUCT&v=1">
<img alt="Synk Status" src="https://img.shields.io/badge/SYNK_SECURITY-MONITORED-GREEN">
</a>
<a href="https://github.com/sourcefuse/loopback4-message-queue-connector/graphs/contributors" target="_blank">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/sourcefuse/loopback4-message-queue-connector?">
</a>
<a href="https://www.npmjs.com/package/loopback4-message-queue-connector" target="_blank">
<img alt="downloads" src="https://img.shields.io/npm/dw/loopback4-message-queue-connector.svg">
</a>
<a href="https://github.com/sourcefuse/loopback4-message-queue-connector/blob/master/LICENSE">
<img src="https://img.shields.io/github/license/sourcefuse/loopback4-message-queue-connector.svg" alt="License" />
</a>
<a href="https://loopback.io/" target="_blank">
<img alt="Powered By LoopBack 4" src="https://img.shields.io/badge/Powered%20by-LoopBack 4-brightgreen" />
</a>
</p>

# Overview

This is a LoopBack 4 extension for adding message queue-based communication to your LoopBack applications. It provides a unified and extensible interface for working with different queuing systems.

✅ Supported Queue Connectors

- SQSConnector – Integrates with AWS SQS using @aws-sdk/client-sqs. Supports both message sending and consumption with polling, visibility timeout, etc.

- BullMQConnector – Integrates with BullMQ (Redis-based queue). Supports advanced job options like retries, backoff, consumer concurrency, and job polling.

- EventBridge - Allows sending events to AWS EventBridge with support for event buses and schemas. Provides the HTTPS endpoint for receiving events.

🧩 Core Features
- Component Based Approach
Central registry for queue components, enabling multi-queue usage in a single application.

- @producer() Decorator
Injects a producer for sending single or multiple typed events to any configured queue.

- @consumer Decorator
Registers a service class as a consumer for a specific event and queue, handling messages automatically.

- IProducer Interface
Exposes send() and sendMultiple() methods to send messages to queues.

- IConsumer Interface
Allows you to implement a handler for a specific event type and queue, supporting strongly typed data flow.

- Typed Event Streams
Encourages defining typed contracts for all events, improving consistency and type safety between producers and consumers.

You can configure one or more of the supported queue types in your application. For each, you simply provide the required connection and queue configuration. The rest—producer/consumer setup, bindings, and event handling—is abstracted and managed by the extension.



[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## Installation

Install EventStreamConnectorComponent using `npm`;

```sh
$ [npm install | yarn add] loopback4-message-queue-connector
```
## Flow Diagram

<img width="659" alt="Screenshot 2025-06-06 at 10 53 06 AM" src="https://github.com/user-attachments/assets/baf1bcaa-5f67-44bb-a01a-b8d1c41644bc" />

## Basic Use

Configure and load EventStreamConnectorComponent in the application constructor
as shown below.

```ts
import {
  EventStreamConnectorComponent
} from 'loopback4-message-queue-connector';

// ...
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.component(EventStreamConnectorComponent);
    // ...
  }
  // ...
}
```

### SQS

To use SQS as their message queue, bind its required config and connector component in your application.

```ts
import {
  SQSConnector,
  SQSBindings,
  EventStreamConnectorComponent
} from 'loopback4-message-queue-connector';

// ...
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super();

    this.component(EventStreamConnectorComponent);
    // SQS Config and its connector
    this.bind(SQSBindings.Config).to({
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
    });

    this.component(SQSConnector);

    // ...
  }
  // ...
}
```

to make the application as consumer, pass 'isConsumer' flag to be true in SQS config. like

```ts
const config = {
  // rest of ur config
  isConsumer: true,
};
```

Please follow the [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html) for more information on the configuration.

### BullMQ

To use BullMq as their message queue, bind its required config and connector component in your application.

```ts
import {
  BullMQConnector,
  BullMQBindings,
  EventStreamConnectorComponent,
} from 'loopback4-message-queue-connector';

// ...
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super();

    this.component(EventStreamConnectorComponent);

    // Bull Mq config and connector
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
    this.component(BullMQConnector);
    // ...
  }
  // ...
}
```

to make the application as consumer, pass 'isConsumer' flag to be true in Bull config. like

```ts
const config = {
  // rest of ur config
  isConsumer: true,
};
```

## Integration

 loopback4-message-queue-connector provides a decorator '@producer()' that can be used to access the producer of each msg queue. It expects one arguement defining the type of queue, of which producer u want to use. like

 ```ts 
 @injectable({scope: BindingScope.TRANSIENT})
export class EventConnector implements IEventConnector<PublishedEvents> {
  constructor(
    @producer(QueueType.EventBridge)
    private producer: Producer,
    @producer(QueueType.SQS)
    private sqsProducer: Producer,
    @producer(QueueType.BullMQ)
    private bullMqProducer: Producer,
  ) {}

  // rest of implementation

}
 ```

 Producer provider two ways of sending events - single event at a time and multiple event at a time.

 ```ts
 export type Producer<Stream extends AnyObject = AnyObject> = {
    send: <Event extends keyof Stream>(data: Stream[Event], topic?: Event) => Promise<void>;
    sendMultiple: <Event extends keyof Stream>(data: Stream[Event][], topic?: Event) => Promise<void>;
};
 ```

It provides '@consumer' decorator to make a service as consumer. consumer needs to follow an interface.

```ts
export interface IConsumer<Stream extends AnyObject, Event extends keyof Stream> {
    event: Event;
    queue: QueueType;
    handle(data: Stream[Event]): Promise<void>;
}
```

and can be used as 

```ts
import {
  IConsumer,
  QueueType,
  consumer,
} from 'loopback4-message-queue-connector';
import { OrchestratorStream, EventTypes, ProvisioningInputs } from '../../types';

@consumer
export class TenantProvisioningConsumerForEventSQS
  implements IConsumer<OrchestratorStream, EventTypes.TENANT_PROVISIONING>
{
  constructor(
  ) {}
  event: EventTypes.TENANT_PROVISIONING = EventTypes.TENANT_PROVISIONING;
  queue: QueueType = QueueType.SQS;
  async handle(data: ProvisioningInputs): Promise<void> {    
    console.log(`SQS: ${this.event} Event Recieved ` + JSON.stringify(data));
    return;
  }
}
```
