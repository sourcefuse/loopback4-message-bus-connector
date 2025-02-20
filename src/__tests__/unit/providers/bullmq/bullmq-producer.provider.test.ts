import {sinon, expect} from '@loopback/testlab';
import {BullMQProducerProvider} from '../../../../providers/bullmq/bullmq-producer.provider';
import {Queue, Job} from 'bullmq';

import {BullMQSendMessage, Config} from '../../../../providers/bullmq/types';
import {HttpErrors} from '@loopback/rest';

describe('BullMQProducerProvider', () => {
  let queueStub: sinon.SinonStubbedInstance<Queue>;
  let jobStub: sinon.SinonStubbedInstance<Job>;
  let provider: BullMQProducerProvider;

  const fakeBullMQConfig: Config = {
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
    provider = new BullMQProducerProvider(fakeBullMQConfig, loggerStub);
  });

  afterEach(() => {
    sinon.restore(); // Restore all stubs after each test
  });

  it('should create provider with valid config', () => {
    expect(provider).to.be.instanceOf(BullMQProducerProvider);
  });

  it('should throw an error if config is invalid', () => {
    expect(() => new BullMQProducerProvider({} as Config, loggerStub)).to.throw(
      HttpErrors.PreconditionFailed,
    );
  });

  it('should add a job to the queue', async () => {
    jobStub.id = 'job-id';

    const bullMqProvider = provider.value();
    const messageMock: BullMQSendMessage = {
      message: {
        name: 'test',
        data: {foo: 'bar'},
      },
    };

    const result = bullMqProvider.send(messageMock);
    await expect(result).to.be.fulfilled();

    sinon.assert.calledOnce(queueStub.add);
    sinon.assert.calledWith(queueStub.add, 'test', {foo: 'bar'});
  });

  it('should handle errors when adding a job to the queue', async () => {
    const messageMock: BullMQSendMessage = {
      message: {
        name: 'test',
        data: {foo: 'bar'},
      },
    };

    const error = new Error('Failed to add job');
    queueStub.add.rejects(error);

    try {
      const bullMqProvider = provider.value();
      await bullMqProvider.send(messageMock);
    } catch (err) {
      expect(err).to.equal(error);
    }
  });
});
