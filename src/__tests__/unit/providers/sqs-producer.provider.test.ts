import {SendMessageCommand, SQSClient} from '@aws-sdk/client-sqs';
import {Context} from '@loopback/core';
import {expect, sinon} from '@loopback/testlab';
import {ILogger} from '@sourceloop/core';
import {ErrorKeys} from '../../../error-keys';
import {queueBindings} from '../../../keys';
import {SqsProducerProvider} from '../../../providers/sqs-producer.provider';
import {SqsConfig} from '../../../sqstypes';

describe('SqsProducerProvider', () => {
  let provider: SqsProducerProvider;
  let sqsClientStub: sinon.SinonStubbedInstance<SQSClient>;
  let loggerStub: sinon.SinonStubbedInstance<ILogger>;
  let sqsConfig: SqsConfig;

  beforeEach(() => {
    // Create stubs for SQSClient and Logger
    sqsClientStub = sinon.createStubInstance(SQSClient);

    loggerStub = {
      info: sinon.stub(),
      error: sinon.stub(),
    } as sinon.SinonStubbedInstance<ILogger>;

    // Sample SqsConfig
    sqsConfig = {
      queueUrls: ['https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue'],
      groupIds: ['group1'],
      sqsType: 'fifo',
      maxNumberOfMessages: 10,
      waitTimeSeconds: 20,
      initObservers: true,
      queueType: 'SQS',
      SqsClient: sqsClientStub,
    };

    // Create an application context and bind the SQS config
    const ctx = new Context();
    ctx.bind(queueBindings.queueConfig).to(sqsConfig);
    ctx.bind('logger').to(loggerStub);

    // Create an instance of SqsProducerProvider
    provider = new SqsProducerProvider(sqsConfig, loggerStub);
  });
  it('should send a message to SQS successfully', async () => {
    const message = {
      body: 'Test Message',
      MessageGroupId: 'group1',
      DelaySeconds: 0,
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
    };

    const sendMessageResult = {MessageId: '12345'};

    // Stub the SQS client's send method to resolve with a success result
    sqsClientStub.send.resolves(sendMessageResult);

    // Replace the real client with the stub in the provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (provider as any).client = sqsClientStub;

    // Call the value method which returns the producer
    const producer = provider.value();

    await producer.send(message);

    // Assertions
    sinon.assert.calledWith(
      sqsClientStub.send,
      sinon.match.instanceOf(SendMessageCommand),
    );
    sinon.assert.calledWith(
      loggerStub.info,
      'Message sent to SQS with ID: 12345',
    );
  });

  it('should throw an error when SQS send fails', async () => {
    const message = {
      body: 'Test Message',
      MessageGroupId: 'group1',
      DelaySeconds: 0,
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
    };

    // Simulate an error from SQS send
    const error = new Error(`${ErrorKeys.PublishFailed}: SQS send failed`);
    sqsClientStub.send.rejects(error);

    // Replace the real client with the stub in the provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (provider as any).client = sqsClientStub;

    // Call the value method which returns the producer
    const producer = provider.value();

    // Expect the producer to throw an error when sending the message
    await expect(producer.send(message)).to.be.rejectedWith(error);

    // Assert that the logger logged the error message
    sinon.assert.calledWith(
      loggerStub.error,
      sinon.match((value: string) => value.includes('Publish Failed')),
    );

    // Assert that the SQS client's send method was called
    sinon.assert.calledWith(
      sqsClientStub.send,
      sinon.match.instanceOf(SendMessageCommand),
    );
  });
});
