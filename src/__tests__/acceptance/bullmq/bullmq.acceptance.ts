import {sinon} from '@loopback/testlab';
import {ProducerApp} from './fixtures/producers-app';
import {TestProducerService} from './fixtures/services/test-producer.service';
import {setupProducerApplication} from './helpers/app-builder';
import {QueueStub} from './stubs/bullmq-queue.stub';
import {Events} from '../test-stream';

interface TestConfig {
  type: string;
  queue: QueueStub;
  condition: () => boolean;
}

const testConfigs: TestConfig[] = [
  {
    type: 'Stubbed queue',
    queue: new QueueStub(),
    condition: () => true,
  },
];

for (const {type, queue, condition} of testConfigs) {
  runBullMqConnectorTests(type, queue, condition);
}

function runBullMqConnectorTests(
  type: string,
  queue: QueueStub,
  condition: () => boolean,
): void {
  describe(`BullMq Connector: With ${type}`, () => {
    let producerApp: ProducerApp | undefined;
    let producerService: TestProducerService;
    let listenerStub: sinon.SinonStub;

    before(async function () {
      if (!condition()) this.skip();
      producerApp = await setupProducerApplication(queue);
      producerService = producerApp.getSync<TestProducerService>(
        `services.TestProducerService`,
      );
      listenerStub = sinon.stub().resolves();
      queue.register(listenerStub);
    });

    beforeEach(() => listenerStub.reset());
    after(async () => await producerApp?.stop());

    runProducerTests(
      () => listenerStub,
      () => producerService,
    );
  });
}

function runProducerTests(
  getListenerStub: () => sinon.SinonStub,
  getProducerService: () => TestProducerService,
): void {
  describe('Producer', () => {
    it('should produce an event for a particular topic', async () => {
      const producerService = getProducerService();
      const listenerStub = getListenerStub();

      await producerService.produceEventA('test string');

      sinon.assert.calledWithExactly(
        listenerStub,
        'Event A',
        'test string',
        {},
      );
    });

    it('should produce multiple events for a particular topic', async () => {
      const producerService = getProducerService();
      const listenerStub = getListenerStub();

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
}
