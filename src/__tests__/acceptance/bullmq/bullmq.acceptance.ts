import {expect, sinon} from '@loopback/testlab';
import {ProducerApp} from './fixtures/producers-app';
import {TestProducerService} from './fixtures/services/test-producer.service';
import {setupProducerApplication} from './helpers/app-builder';
import {QueueStub} from './stubs/bullmq-queue.stub';
import {Events} from '../test-stream';
import {DEFAULT_SOURCE} from '../../../constants';

[
  {
    type: 'Stubbed queue',
    queue: new QueueStub(),
    condition: () => true,
  },
].forEach(({type, queue, condition}) => {
  describe(`BullMq Connector: With ${type}`, () => {
    let producerApp: ProducerApp | undefined;
    let producerService: TestProducerService;
    let listenerStub: sinon.SinonStub;
    before(async function () {
      if (!condition()) {
        // eslint-disable-next-line  @typescript-eslint/no-invalid-this
        this.skip();
      }
      producerApp = await setupProducerApplication(queue);
      producerService = producerApp.getSync<TestProducerService>(
        `services.TestProducerService`,
      );
      listenerStub = sinon.stub().resolves();
      if (queue) {
        queue.register(listenerStub);
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
        sinon.assert.calledWithExactly(
          listenerStub,
          'Event A',
          'test string',
          {},
        );
      });
      it('should produce multiple events for a particular topic', async () => {
        const data = ['test string 1', 'test string 2'];
        await producerService.produceMultipleA(data);
        sinon.assert.calledWithExactly(
          listenerStub,
          JSON.stringify(
            data.map(d => ({name: 'Event A', data: d, type: Events.A})),
          ),
          '',
          {},
        );
      });
    });
  });
});
