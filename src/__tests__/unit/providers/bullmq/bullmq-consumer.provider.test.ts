import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {BullMQConsumerProvider} from '../../../../providers/bullmq/bullmq-consumer.provider';
import {Queue} from 'bullmq';
import {Config} from '../../../../providers/bullmq';
import {ILogger} from '@sourceloop/core';

describe('BullMQConsumerProvider', () => {
  let provider: BullMQConsumerProvider;
  let queueStub: StubbedInstanceWithSinonAccessor<Queue>;
  let consumerHandlerStub: sinon.SinonStub;

  beforeEach(() => {
    queueStub = createStubInstance(Queue);
    consumerHandlerStub = sinon.stub();

    const fakeBullMQConfig: Config = {
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
    // Mock queue's opts if necessary
    Object.defineProperty(queueStub, 'name', {
      get: sinon.stub().returns('test-queue'),
    });
    Object.defineProperty(queueStub, 'opts', {
      get: sinon.stub().returns({connection: {host: 'localhost', port: 6379}}),
    });

    const loggerStub: ILogger = {
      log: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub(),
    };
    provider = new BullMQConsumerProvider(
      fakeBullMQConfig,
      queueStub,
      consumerHandlerStub,
      loggerStub,
    );
  });
  afterEach(() => {});

  it('initializes with minimum workers', () => {
    expect(provider).to.not.be.undefined();
  });

  it('processes messages correctly', async () => {
    const mockJob = {
      id: '123',
      data: {test: 'data'},
    };

    await provider['processMessage'](mockJob);
    expect(consumerHandlerStub.calledOnce).to.be.true();
    expect(consumerHandlerStub.calledWith(mockJob.data)).to.be.true();
  });

  it('handles auto-scaling up when queue has more messages', async () => {
    queueStub.stubs.getWaitingCount.resolves(5);
    await provider['autoScaler']();
    // Verify worker count increased
    expect(provider['workers'].length).to.be.greaterThan(0);
  });

  it('handles auto-scaling down when queue is empty', async () => {
    queueStub.stubs.getWaitingCount.resolves(0);
    await provider['autoScaler']();
    // Verify worker count decreased
    expect(provider['workers'].length).to.equal(1);
  });

  it('stops all workers when stop is called', () => {
    provider.stop();
    expect(provider['shuttingDown']).to.be.true();
  });

  it('handles errors during message processing', async () => {
    const mockJob = {
      id: '123',
      data: {test: 'data'},
    };
    consumerHandlerStub.rejects(new Error('Test error'));
    try {
      await provider['processMessage'](mockJob);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Test error');
    }
  });
});
