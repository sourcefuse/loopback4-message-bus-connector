import {expect, sinon} from '@loopback/testlab';

import {
  SendMessageBatchCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {Config} from '../../../../strategies';
import {SqsProducerService} from '../../../../strategies/sqs/services';
describe('SQSProducerProvider', () => {
  let producer: SqsProducerService;

  let fakeSQSClient: SQSClient;
  let sendStub: sinon.SinonStub;
  const sendResponse = {MessageId: '1234'};

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

  beforeEach(() => {
    sendStub = sinon.stub().resolves(sendResponse);
    fakeSQSClient = {
      send: sendStub,
    } as unknown as SQSClient;

    producer = new SqsProducerService(fakeSQSClient, fakeSQSConfig, loggerStub);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should create provider instance', () => {
    expect(producer).to.be.instanceOf(SqsProducerService);
  });

  it('should send a single message using send()', async () => {
    await producer.send({
      MessageBody: JSON.stringify({foo: 'bar'}),
    });

    sinon.assert.calledOnce(sendStub);
    sinon.assert.calledWithMatch(
      sendStub,
      sinon.match.instanceOf(SendMessageCommand),
    );
  });

  it('should send multiple messages using sendMultiple()', async () => {
    await producer.sendMultiple([
      {
        id: 'msg1',
        MessageBody: 'message1',
      },
      {
        id: 'msg2',
        MessageBody: 'message2',
      },
    ]);

    sinon.assert.calledOnce(sendStub);
    sinon.assert.calledWithMatch(
      sendStub,
      sinon.match.instanceOf(SendMessageBatchCommand),
    );
  });


  it('should log partial failures on sendMultiple()', async () => {
    sendStub.resolves({
      Successful: [],
      Failed: [{Id: 'msg2', Message: 'Failed to send'}],
    });

    await producer.sendMultiple([
      {id: 'msg1', MessageBody: 'message1'},
      {id: 'msg2', MessageBody: 'message2'},
    ]);

    sinon.assert.calledWithMatch(
      loggerStub.warn,
      sinon.match.string,
      sinon.match.string,
    );
  });
});
