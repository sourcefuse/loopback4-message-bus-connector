import {sinon} from '@loopback/testlab';
import {EventHandlerService} from '../../../services';
import {ConsumerApp} from './fixtures/consumer-app';
import {Events, TestStream} from '../test-stream';
import {setupConsumerApplication} from './helpers/app-builder';
import {QueueType} from '../../../types';
import {QueueStub} from './stubs/bullmq-queue.stub';
interface MockBullMQConsumerService {
  start: sinon.SinonStub;
  stop: sinon.SinonStub;
  addWorker: sinon.SinonStub;
  removeWorker: sinon.SinonStub;
  autoScaler: sinon.SinonStub;
  startAutoScaler: sinon.SinonStub;
  processMessage: sinon.SinonStub;
}

let mockBullMQConsumerService: MockBullMQConsumerService;

describe('EventHandlerService', () => {
  let consumerApp: ConsumerApp;
  let consumerStub: sinon.SinonStub;
  let handlerService: EventHandlerService<TestStream>;
  let mockBullMQConsumerService: MockBullMQConsumerService;

  before(async () => {
    const queue = new QueueStub();
    consumerStub = sinon.stub().resolves();

    // Create a mock BullMQConsumerService that doesn't connect to Redis
    mockBullMQConsumerService = {
      start: sinon.stub(),
      stop: sinon.stub(),
      addWorker: sinon.stub(),
      removeWorker: sinon.stub().resolves(),
      autoScaler: sinon.stub().resolves(),
      startAutoScaler: sinon.stub(),
      processMessage: sinon.stub().resolves(),
    };

    consumerApp = await setupConsumerApplication(
      queue,
      consumerStub,
      mockBullMQConsumerService,
    );

    handlerService = consumerApp.getSync<EventHandlerService<TestStream>>(
      `services.EventHandlerService`,
    );
  });

  beforeEach(() => {
    consumerStub.reset();
    // Reset all mock stubs
    Object.values(mockBullMQConsumerService).forEach(stub => {
      if (typeof stub.reset === 'function') {
        stub.reset();
      }
    });
  });

  after(async () => {
    await consumerApp.stop();
  });

  it('should handle an event if a handler is registered', async () => {
    await handlerService.handle(
      Events.A,
      {
        name: 'Event A',
        data: 'test string',
      },
      QueueType.BullMQ,
    );
    sinon.assert.calledWithExactly(consumerStub, {
      name: 'Event A',
      data: 'test string',
    });
  });
});
