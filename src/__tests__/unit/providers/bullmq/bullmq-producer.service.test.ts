import {expect, sinon} from '@loopback/testlab';
import {Job, Queue} from 'bullmq';

import {HttpErrors} from '@loopback/rest';
import {
  BullMQConfig,
  BullMQQueueProvider,
  BullMQSendMessage,
} from '../../../../strategies';
import {BullMQProducerService} from '../../../../strategies/bullmq/services';

describe('BullMQProducerProvider', () => {
  let queueStub: sinon.SinonStubbedInstance<Queue>;
  let jobStub: sinon.SinonStubbedInstance<Job>;
  let producer: BullMQProducerService;

  const fakeBullMQConfig: BullMQConfig = {
    // queueConfig: {
    //   QueueName: 'test-queue',
    // },
    QueueName: 'test-queue',
    redisConfig: {
      host: 'localhost',
      port: 6379,
    },
    consumerConfig: {
      MinConsumers: 1,
      MaxConsumers: 3,
      QueuePollInterval: 1000,
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
    // Stub Queue class methods
    queueStub = sinon.createStubInstance(Queue);
    jobStub = sinon.createStubInstance(Job);

    // Ensure 'add' resolves to a stubbed job
    queueStub.add.resolves(jobStub);

    // Stub Queue constructor to return the stubbed instance
    sinon.stub(Queue.prototype, 'add').value(queueStub.add);

    // Create the provider instance with the fake config
    producer = new BullMQProducerService(
      fakeBullMQConfig,
      queueStub,
      loggerStub,
    );
  });

  afterEach(() => {
    sinon.restore(); // Restore all stubs after each test
  });

  it('should create provider with valid config', () => {
    expect(producer).to.be.instanceOf(BullMQProducerService);
  });

  it('should throw an error if config is invalid', () => {
    const invalidConfig = {
      redisConfig: {},
    } as BullMQConfig;

    const sqsProvider = new BullMQQueueProvider(invalidConfig);
    expect(() => sqsProvider.value()).to.throw(HttpErrors.PreconditionFailed);
  });

  it('should add a job to the queue', async () => {
    // simulate job return with id
    const mockJob = {id: 'job-id'};
    queueStub.add.resolves(mockJob as Job);

    const messageMock = {
      name: 'test',
      data: {foo: 'bar'},
      options: {},
    };

    const result = producer.send(messageMock);
    await expect(result).to.be.fulfilled();

    sinon.assert.calledOnce(queueStub.add);
    sinon.assert.calledWith(queueStub.add, 'test', {foo: 'bar'}, {});
  });

  it('should handle errors when adding a job to the queue', async () => {
    const messageMock: BullMQSendMessage = {
      name: 'test',
      data: {foo: 'bar'},
    };

    const error = new Error('Failed to add job');
    queueStub.add.rejects(error);

    try {
      await producer.send({
        name: messageMock.name,
        data: messageMock.data,
      });
    } catch (err) {
      expect(err).to.equal(error);
    }
  });
});
