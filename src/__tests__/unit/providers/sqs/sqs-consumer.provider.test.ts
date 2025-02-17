import {SQSConsumerProvider} from '../../../../providers/sqs/sqs-consumer.provider';
import {SQSClient} from '@aws-sdk/client-sqs';
import {expect, sinon} from '@loopback/testlab';
import {HttpErrors} from '@loopback/rest';

import {Config} from '../../../../providers/sqs/types';

describe('SQSConsumerProvider', () => {
  let provider: SQSConsumerProvider;
  let sqsConsumerHandlerStub: sinon.SinonStub;
  let startConsumerStub: sinon.SinonStub;

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
    provider = new SQSConsumerProvider(fakeSQSConfig, sqsConsumerHandlerStub);

    sqsConsumerHandlerStub = sinon.stub().resolves();
    startConsumerStub = sinon.stub(provider, 'startConsumer').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create provider with valid config', () => {
    expect(provider).to.be.instanceOf(SQSConsumerProvider);
  });

  it('should throw an error if config is missing', () => {
    expect(
      () =>
        new SQSConsumerProvider(
          null as unknown as Config,
          sqsConsumerHandlerStub,
        ),
    ).to.throw(HttpErrors.PreconditionFailed);
  });

  it('should initialize SQS client with correct credentials', async () => {
    provider = new SQSConsumerProvider(fakeSQSConfig, sqsConsumerHandlerStub);

    expect(provider['client']).to.be.instanceOf(SQSClient);

    // Resolve the region dynamically
    const resolvedRegion = await provider['client'].config.region();
    expect(resolvedRegion).to.equal(fakeSQSConfig.Credentials.region);

    // Resolve credentials dynamically
    const credentials = await provider['client'].config.credentials();
    expect(credentials.accessKeyId).to.equal(
      fakeSQSConfig.Credentials.accessKeyId,
    );
    expect(credentials.secretAccessKey).to.equal(
      fakeSQSConfig.Credentials.secretAccessKey,
    );
  });

  it('processes messages correctly', async () => {
    const mockJob = {
      MessageId: '1',
      ReceiptHandle: 'handle1',
      Body: 'message1',
    };

    await expect(provider.startConsumer()).to.be.fulfilled();
    sinon.assert.calledOnce(startConsumerStub);
    await sqsConsumerHandlerStub(mockJob);
    expect(sqsConsumerHandlerStub.calledOnce).to.be.true();
    expect(sqsConsumerHandlerStub.calledWith(mockJob)).to.be.true();
  });

  it('should stop consumer gracefully', async () => {
    const stopSpy = sinon.spy(provider, 'stop');
    provider.stop();
    expect(stopSpy.calledOnce).to.be.true();
  });
});
