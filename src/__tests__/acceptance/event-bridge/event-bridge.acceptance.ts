import {expect, sinon} from '@loopback/testlab';
import {ProducerApp} from './fixtures/producers-app';
import {TestProducerService} from './fixtures/services/test-producer.service';
import {setupProducerApplication} from './helpers/app-builder';
import {EventBridgeStub} from './stubs/event-bridge-client.stub';
import {Events} from '../test-stream';
import {DEFAULT_SOURCE} from '../../../constants';

[
  // can add tests with real AWS client here
  {
    type: 'Stubbed Client',
    client: new EventBridgeStub(),
    condition: () => true,
  },
].forEach(({type, client, condition}) => {
  describe(`EventBridge Connector: With ${type}`, () => {
    let producerApp: ProducerApp | undefined;
    let producerService: TestProducerService;
    let listenerStub: sinon.SinonStub;
    before(async function () {
      if (!condition()) {
        // eslint-disable-next-line  @typescript-eslint/no-invalid-this
        this.skip();
      }
      producerApp = await setupProducerApplication(client);
      producerService = producerApp.getSync<TestProducerService>(
        `services.TestProducerService`,
      );
      listenerStub = sinon.stub().resolves();
      if (client) {
        client.register(listenerStub);
      }
    });
    beforeEach(() => {
      listenerStub.reset();
    });
    after(async () => {
      await producerApp?.stop();
    });
    describe('Producer', () => {
      it('should produce an event for a particular topic', async () => {
        await producerService.produceEventA('test string');
        sinon.assert.calledWithExactly(listenerStub, Events.A, DEFAULT_SOURCE, {
          name: 'Event A',
          data: 'test string',
          type: Events.A
        });
      });
      it('should produce multiple events for a particular topic', async () => {
        await producerService.produceMultipleA([
          'test string 1',
          'test string 2',
        ]);
        const calls = listenerStub.getCalls();
        expect(calls).to.have.length(2);
        sinon.assert.calledWithExactly(calls[0], Events.A, DEFAULT_SOURCE, {
          name: 'Event A',
          data: 'test string 1',
          type: Events.A
        });
        sinon.assert.calledWithExactly(calls[1], Events.A, DEFAULT_SOURCE, {
          name: 'Event A',
          data: 'test string 2',
          type: Events.A
        });
      });
    });
  });
});
