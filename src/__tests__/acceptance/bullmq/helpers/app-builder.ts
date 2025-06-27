import {givenHttpServerConfig,sinon} from '@loopback/testlab';
import {ProducerApp} from '../fixtures/producers-app';
import {BullMQBindings} from '../../../../strategies';
import {ConsumerApp} from '../fixtures/consumer-app';
import {Queue} from 'bullmq';

export async function setupProducerApplication(
  queue?: unknown,
): Promise<ProducerApp> {
  const restConfig = givenHttpServerConfig({});
  setUpEnv();

  const app = new ProducerApp({
    rest: restConfig,
  });
  if (queue) {
    app.bind(BullMQBindings.BullMQQueue).to(queue as Queue);
  }

  await app.boot();
  await app.start();

  return app;
}

export async function setupConsumerApplication(
  queue?: unknown,
  consumer?: sinon.SinonStub,
  bullMQConsumerService?: unknown,
): Promise<ConsumerApp> {
  const restConfig = givenHttpServerConfig({});
  setUpEnv();

  const app = new ConsumerApp({
    rest: restConfig,
  });

  if (queue) {
    app.bind(BullMQBindings.BullMQQueue).to(queue as Queue);
  }

  if (consumer) {
    app.bind('consumer.stub').to(consumer);
  }

  // Bind a mock BullMQConsumerService to prevent Redis connection
  if (bullMQConsumerService) {
    app.bind('sf.queue.bullmq.consumer.provider').to(bullMQConsumerService);
  } else {
    // Create a default mock that doesn't connect to Redis
    const mockBullMQConsumerService = {
      start: sinon.stub(),
      stop: sinon.stub(),
      addWorker: sinon.stub(),
      removeWorker: sinon.stub().resolves(),
      autoScaler: sinon.stub().resolves(),
      startAutoScaler: sinon.stub(),
      processMessage: sinon.stub().resolves(),
    };
    app.bind(BullMQBindings.BullMQConsumer.key).to(mockBullMQConsumerService);
  }

  await app.boot();
  await app.start();

  return app;
}

function setUpEnv() {
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_TRACING = '0';
  process.env.ENABLE_OBF = '0';
}
