import {expect, sinon} from '@loopback/testlab';

import {SqsProducerProvider} from '../../../../providers/sqs/sqs-producer.provider';
import {SQSClient} from '@aws-sdk/client-sqs';
import {Config} from '../../../../providers/sqs/types';
import {HttpErrors} from '@loopback/rest';
describe('SQSProducerProvider', () => {
  let provider: SqsProducerProvider;

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
  const loggerStub = {
    log: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    debug: sinon.stub(),
  };

  beforeEach(() => {});
  afterEach(() => {
    sinon.restore();
  });

  it('should create provider with valid config', () => {
    provider = new SqsProducerProvider(fakeSQSConfig, loggerStub);
    expect(provider).to.be.instanceOf(SqsProducerProvider);
  });

  it('should throw an error if config is missing', () => {
    expect(
      () => new SqsProducerProvider(null as unknown as Config, loggerStub),
    ).to.throw(HttpErrors.PreconditionFailed);
  });

  it('should initialize SQS client with correct credentials', async () => {
    provider = new SqsProducerProvider(fakeSQSConfig, loggerStub);

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
});
