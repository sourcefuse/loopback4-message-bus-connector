import {givenHttpServerConfig} from '@loopback/testlab';
import {ProducerApp} from '../fixtures/producers-app';
import {SQSBindings} from '../../../../strategies';
import {ConsumerApp} from '../fixtures/consumer-app';
import { SQSClient } from '@aws-sdk/client-sqs';

export async function setupProducerApplication(
  client?: unknown,
): Promise<ProducerApp> {
  const restConfig = givenHttpServerConfig({});
  setUpEnv();

  const app = new ProducerApp({
    rest: restConfig,
  });
  if (client) {
    app.bind(SQSBindings.Client).to(client as SQSClient);
  }

  await app.boot();
  await app.start();

  return app;
}

export async function setupConsumerApplication(
  client?: unknown,
  consumer?: sinon.SinonStub,
): Promise<ConsumerApp> {
  const restConfig = givenHttpServerConfig({});
  setUpEnv();

  const app = new ConsumerApp({
    rest: restConfig,
  });
  if (client) {
    app.bind(SQSBindings.Client).to(client as SQSClient);
  }
  if (consumer) {
    app.bind('consumer.stub').to(consumer);
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
