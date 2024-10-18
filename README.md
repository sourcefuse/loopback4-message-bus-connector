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
import {MessageBusQueueConnectorsComponent, MessageBusQueueConnectorsComponentOptions, DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS} from 'message-bus-queue-connectors';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.bind(queueBindings.queueConfig).to(
      options.sqsConfig
    );


    this.component(MessageBusQueueConnectorsComponent);
    // ...
  }
  // ...
}
```

#### SQS Config
```ts
const config = {
      initObservers: true,
      clientConfig: {
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_SECRET_ACCESS_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        maxAttempts: 3,
        retryMode: 'standard',
      },
      queueUrl: process.env.SQS_QUEUE_URL,
      groupId: process.env?.SQS_GROUP_ID ?? 'group1',
      maxNumberOfMessages: maxNumberOfMessages,
      waitTimeSeconds: waitTimeSeconds,
      queueType: 'SQS',
      sqsType: 'fifo',
  }
```
Please follow the [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html) for more information on the configuration.

### BullMQ
```ts
import {MessageBusQueueConnectorsComponent, MessageBusQueueConnectorsComponentOptions, DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS} from 'message-bus-queue-connectors';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.bind(queueBindings.queueConfig).to(
      options.bullMQConfig
    );


    this.component(MessageBusQueueConnectorsComponent);
    // ...
  }
  // ...
}
```


## Produce and consume SQS event
queueType: `Type of queue` <br />;
groupId : `Message group ID to group message and consume them accordingly` <br />;



#### Producer setup
```ts
import {Producer, producer, SqsSendMessage} from '@sourceloop/queue';

type InputMessageType = {
  // Define your Input Message type here
}
@injectable({scope: BindingScope.TRANSIENT})
export class ProducerService {
  constructor(
    @producer('SQS')
    private readonly sqsProducer?: Producer<SqsSendMessage<InputMessageType>>,
  ) {}

  async extract() {

     await this.sqsProducer.send({body: {} //type InputMessageType ,
          MessageGroupId: `group1`});
  }
}
```

#### Consumer setup
```ts
import { SQSConsumerHandler, IConsumerHandler} from '@sourceloop/queue';

type queuePayload = {
  // Define your payload type here
};

@injectable(SQSConsumerHandler)
export class TransformQueueConsumerService
  implements IConsumerHandler<'SQS', string, queuePayload>
{
  queueType: string = 'SQS';
  // register consumer for particular message group
  groupId: string = QueueEvent.Transform;

  async handler(payload: queuePayload) {
    // handle your queue payload here
  }
}

```

#### BullMQ Config
```ts
const config = {
      queueType: 'BullMQ',
      initObservers: true,

      connection: {
            host: process.env.BULLMQ_HOST ?? 'localhost',
            port: +(process.env.BULLMQ_PORT ?? 6379),
      },
      delay: 5,
      removeOnComplete: true,
      groupId:'group1',
      queueName: 'bullmq-queue',
  }
```
## Produce and consume BullMQ event
queueType: `Type of queue` <br />;
groupId : `Message group ID to group message and consume them accordingly` <br />;



#### Producer setup
```ts
import {Producer, producer, BullMQSendMessage} from '@sourceloop/queue';

type InputMessageType = {
  // Define your Input Message type here
}
@injectable({scope: BindingScope.TRANSIENT})
export class ProducerService {
  constructor(
   @producer('BullMQ')
    private readonly bullmqProducer?: Producer<BullMQSendMessage<InputMessageType>>,
  ) {}

  async extract() {

     await this.bullmqProducer.send({
          name:Math.random().toString() //name of the job,
          body: {} //type InputMessageType ,
          MessageGroupId: `group1`});
  }
}
```

#### Consumer setup
```ts
import { SQSConsumerHandler, IConsumerHandler} from '@sourceloop/queue';

type queuePayload = {
  // Define your payload type here
};

@injectable(BullMQConsumerHandler)
export class TransformQueueConsumerService
  implements IConsumerHandler<'BullMQ', string, queuePayload>
{
  queueType: string = 'BullMQ';
  // register consumer for particular message group
  groupId: string = QueueEvent.Transform;

  async handler(payload: queuePayload) {
    // handle your queue payload here
  }
}
```
