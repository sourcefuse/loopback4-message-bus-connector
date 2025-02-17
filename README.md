# Message bus queue connectors
This is the package for the message bus queue connectors component for LoopBack 4 applications.
It provides components to work with queues such as SQS, BullMQ

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install MessageBusQueueConnectorsComponent using `npm`;

```sh
$ [npm install | yarn add] message-bus-queue-connectors
```

## Basic Use

Configure and load MessageBusQueueConnectorsComponent in the application constructor
as shown below.

### SQS
```ts
import {SqsProducerProvider, SQSBindings, SQSConsumerObserver, SQSConsumerProvider} from 'message-bus-queue-connectors/sqs';

// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.bind(SqsClientBindings.Config).to(
      options.sqsConfig
    );
    
    this.bind(SQSBindings.SQSProducerProvider).toProvider(SqsProducerProvider);
    // ...

    // Add lifecycle observer
    this.lifeCycleObserver(SQSConsumerObserver);

    // ...
  }
  // ...
}
```

#### SQS Config
```ts
const config = {
  queueConfig: {
    QueueUrl: "sqs-queue-url",,
    MessageRetentionPeriod: 1,
    MaximumMessageSize: 262144 ,
    ReceiveMessageWaitTimeSeconds:  60,
    VisibilityTimeout: 300,
    },
    Credentials: {
      region: "aws-region",
      accessKeyId: "aws-access-key-id",
      secretAccessKey: "aws-secret-access-key",
    },
    ConsumerConfig: {
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
      maxConsumers: 2,
    },
}

```
#### Consumer setup
Below is consumer handler example.
```ts
this.bind(SQSBindings.SQSConsumerProvider).toProvider(SQSConsumerProvider);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bind(SQSBindings.SQSConsumerHandler).to(async (message: string) => {
      console.log('Processing message SQS---------:', message);
      
    });

```
Please follow the [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html) for more information on the configuration.


### BullMQ

```ts
import {BullMQProducerProvider, BullMQBindings,  BullMQConsumerObserver} from 'message-bus-queue-connectors/bullmq';

// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.bind(BullMQBindings.Config).to(
      options.config
    );
    
    this.bind(BullMQBindings.BullMQProducerProvider).toProvider(BullMQProducerProvider);
    // ...
    // Add lifecycle observer
    this.lifeCycleObserver(BullMQConsumerObserver);
    // ...
  }
  // ...
}
```

#### BullMQ config
```ts
const config = {
  queueConfig:{
    QueueName: 'BullMQ1',
  },
  QueueName: 'BullMQ1',
  producerConfig: {
  defaultJobOptions: {attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    } 
  },
  consumerConfig: {
    MaxConsumers: 1,
    MinConsumers: 1,
  },
  redisConfig: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: +(process.env.REDIS_PORT ?? 6379),
  }
 
}

```

#### Consumer setup
Below is consumer handler example.
```ts
this.bind(BullMQBindings.BullMQConsumerProvider).toProvider(BullMQConsumerProvider);
    
    this.bind(BullMQBindings.BullMQConsumerHandler).to(async (message: string) => {
      console.log('Processing message ---------:', message);      
    });   
```
