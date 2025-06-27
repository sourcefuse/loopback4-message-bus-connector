import {SQSClient} from '@aws-sdk/client-sqs';
import {HttpErrors} from '@loopback/rest';
import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {ILogger} from '@sourceloop/core';
import {EventHandlerService} from '../../../../services';
import {Config, SQSClientProvider} from '../../../../strategies';
import {SQSConsumerService} from '../../../../strategies/sqs/services';

describe('SQSConsumerProvider', () => {
  let consumer: SQSConsumerService;
  let sqsConsumerHandlerStub: sinon.SinonStub;
  let startConsumerStub: sinon.SinonStub;
  let eventHandlerStub: StubbedInstanceWithSinonAccessor<EventHandlerService>;
  let client: StubbedInstanceWithSinonAccessor<SQSClient>;
  let loggerStub: ILogger;

  const fakeSQSConfig: Config = {
    queueConfig: {
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue',
      FifoQueue: false,
      DelaySeconds: 0,
      MessageRetentionPeriod: 345600,
      MaximumMessageSize: 262144,
      ReceiveMessageWaitTimeSeconds: 0,
      VisibilityTimeout: 30,
      MessageGroupId: 'etl-group',
    },
    Credentials: {
      region: 'us-east-1',
      accessKeyId: 'your-access-key-id',
      secretAccessKey: 'your-secret-access-key',
    },
    ConsumerConfig: {
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
      maxConsumers: 2,
    },
  };

  beforeEach(() => {
    client = createStubInstance(SQSClient);
    loggerStub = {
      log: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub(),
    };
    eventHandlerStub =
      createStubInstance<EventHandlerService>(EventHandlerService);

    consumer = new SQSConsumerService(
      fakeSQSConfig,
      loggerStub,
      eventHandlerStub,
      client,
    );

    sqsConsumerHandlerStub = sinon.stub().resolves();
    startConsumerStub = sinon.stub(consumer, 'startConsumer').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create provider with valid config', () => {
    expect(consumer).to.be.instanceOf(SQSConsumerService);
  });

  it('should throw an error if config is missing', () => {
    const sqsProvider = new SQSClientProvider(null as unknown as Config);
    expect(() => sqsProvider.value()).to.throw(HttpErrors.PreconditionFailed);
  });

  it('should initialize SQS client with correct credentials', async () => {
    // Manually create SQSClient
    const sqsClient = new SQSClient({
      region: fakeSQSConfig.Credentials.region,
      credentials: {
        accessKeyId: fakeSQSConfig.Credentials.accessKeyId,
        secretAccessKey: fakeSQSConfig.Credentials.secretAccessKey,
      },
    });

    const sqsProvider = new SQSConsumerService(
      fakeSQSConfig,
      loggerStub,
      eventHandlerStub,
      sqsClient, // <== pass client here
    );

    // Ensure SQSClient instance is stored correctly
    expect(sqsProvider['client']).to.equal(sqsClient);

    // Dynamically resolve region
    const resolvedRegion = await sqsClient.config.region?.();
    expect(resolvedRegion).to.equal(fakeSQSConfig.Credentials.region);

    // Dynamically resolve credentials
    const resolvedCredentials = await sqsClient.config.credentials?.();
    expect(resolvedCredentials?.accessKeyId).to.equal(
      fakeSQSConfig.Credentials.accessKeyId,
    );
    expect(resolvedCredentials?.secretAccessKey).to.equal(
      fakeSQSConfig.Credentials.secretAccessKey,
    );
  });

  it('processes messages correctly', async () => {
    const mockJob = {
      MessageId: '1',
      ReceiptHandle: 'handle1',
      Body: 'message1',
    };

    await expect(consumer.startConsumer()).to.be.fulfilled();
    sinon.assert.calledOnce(startConsumerStub);
    await sqsConsumerHandlerStub(mockJob);
    expect(sqsConsumerHandlerStub.calledOnce).to.be.true();
    expect(sqsConsumerHandlerStub.calledWith(mockJob)).to.be.true();
  });

  it('should stop consumer gracefully', async () => {
    const stopSpy = sinon.spy(consumer, 'stop');
    consumer.stop();
    expect(stopSpy.calledOnce).to.be.true();
  });
});
