import {expect, sinon} from '@loopback/testlab';
import {EventHandlerService} from '../../../services';
import {ConsumerApp} from './fixtures/consumer-app';
import {EventBridgeStub} from './stubs/event-bridge-client.stub';
import {Events, TestStream} from '../test-stream';
import {setupConsumerApplication} from './helpers/app-builder';
import {QueueType} from '../../../types';

describe('EventHandlerService', () => {
  let consumerApp: ConsumerApp;
  let consumerStub: sinon.SinonStub;
  let handlerService: EventHandlerService<TestStream>;
  before(async () => {
    const client = new EventBridgeStub();
    consumerStub = sinon.stub().resolves();
    consumerApp = await setupConsumerApplication(client, consumerStub);

    handlerService = consumerApp.getSync<EventHandlerService<TestStream>>(
      `services.EventHandlerService`,
    );
  });
  beforeEach(() => {
    consumerStub.reset();
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
      QueueType.EventBridge,
    );
    sinon.assert.calledWithExactly(consumerStub, {
      name: 'Event A',
      data: 'test string',
    });
  });

  it('should handle an event even if multiple handlers are registered', async () => {
    await handlerService.handle(
      Events.B,
      {
        name: 'Event B',
        data: 4,
      },
      QueueType.EventBridge,
    );
    const calls = consumerStub.getCalls();
    // as we have two consumers for Event B, we should have two calls
    expect(calls).to.have.length(2);
    sinon.assert.calledWithExactly(calls[0], {
      name: 'Event B',
      data: 4,
    });
    sinon.assert.calledWithExactly(calls[1], {
      name: 'Event B',
      data: 4,
    });
  });
});
