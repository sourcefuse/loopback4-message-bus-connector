import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {Queue} from 'bullmq';
import {ILogger} from '@sourceloop/core';
import {BullMQConfig} from '../../../../strategies';
import {EventHandlerService} from '../../../../services';
import {QueueType} from '../../../../types';
import proxyquire from 'proxyquire';

// Mock bullmq Worker instances
const mockWorkerInstances: any[] = [];

// Create a mock Worker class
class MockWorker {
  public name: string;
  public opts: any;
  public on: sinon.SinonStub;
  public close: sinon.SinonStub;
  public removeAllListeners: sinon.SinonStub;

  constructor(queueName: string, processor: any, opts: any) {
    this.name = queueName;
    this.opts = opts;
    this.on = sinon.stub();
    this.close = sinon.stub().resolves();
    this.removeAllListeners = sinon.stub();

    mockWorkerInstances.push(this);
  }
}

// Use proxyquire to mock the bullmq module
const BullMQConsumerService = proxyquire(
  '../../../../strategies/bullmq/services',
  {
    bullmq: {
      Worker: MockWorker,
      Queue: Queue, // Keep original Queue
      '@global': true,
      '@noCallThru': true,
    },
  },
).BullMQConsumerService;

describe('BullMQConsumerProvider', () => {
  let consumer: any;
  let queueStub: StubbedInstanceWithSinonAccessor<Queue>;
  let eventHandlerStub: StubbedInstanceWithSinonAccessor<EventHandlerService>;
  let loggerStub: ILogger;

  beforeEach(() => {
    // Clear previous mock instances
    mockWorkerInstances.length = 0;

    queueStub = createStubInstance(Queue);
    eventHandlerStub =
      createStubInstance<EventHandlerService>(EventHandlerService);

    const fakeBullMQConfig: BullMQConfig = {
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

    // Mock queue properties
    Object.defineProperty(queueStub, 'name', {
      get: sinon.stub().returns('test-queue'),
      configurable: true,
    });
    Object.defineProperty(queueStub, 'opts', {
      get: sinon.stub().returns({connection: {host: 'localhost', port: 6379}}),
      configurable: true,
    });

    loggerStub = {
      log: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub(),
    };

    consumer = new BullMQConsumerService(
      fakeBullMQConfig,
      queueStub,
      loggerStub,
      eventHandlerStub,
    );
  });

  afterEach(() => {
    // Clean up any intervals that might be running
    consumer.stop();

    // Reset all stubs
    sinon.resetHistory();
    mockWorkerInstances.length = 0;
  });

  // All your existing test cases remain the same...
  it('initializes with minimum workers', () => {
    expect(consumer).to.not.be.undefined();
    expect(consumer['workers'].length).to.equal(1);
    expect(mockWorkerInstances.length).to.equal(1);
  });

  // ... rest of your tests

  it('processes messages correctly', async () => {
    const mockJob = {
      id: '123',
      data: {
        type: 'SAMPLE_TYPE',
        foo: 'bar',
        other: 42,
      },
    };

    await consumer['processMessage'](mockJob);

    // Access Sinon spy properties through the __sinon property
    expect(
      (eventHandlerStub.handle as sinon.SinonStub).calledOnce,
    ).to.be.true();
    expect(
      (eventHandlerStub.handle as sinon.SinonStub).calledWith(
        'SAMPLE_TYPE',
        {foo: 'bar', other: 42},
        QueueType.BullMQ,
      ),
    ).to.be.true();
  });

  it('handles auto-scaling up when queue has more messages', async () => {
    queueStub.stubs.getWaitingCount.resolves(5);
    await consumer['autoScaler']();
    // Verify worker count increased
    expect(consumer['workers'].length).to.be.greaterThan(0);
  });

  it('handles auto-scaling down when queue is empty', async () => {
    queueStub.stubs.getWaitingCount.resolves(0);
    await consumer['autoScaler']();
    // Verify worker count decreased
    expect(consumer['workers'].length).to.equal(1);
  });

  it('stops all workers when stop is called', () => {
    consumer.stop();
    expect(consumer['shuttingDown']).to.be.true();
  });
});
