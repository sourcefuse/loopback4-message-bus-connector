import {expect, sinon} from '@loopback/testlab';
import {ProducerApp} from './fixtures/producers-app';
import {TestProducerService} from './fixtures/services/test-producer.service';
import {setupProducerApplication} from './helpers/app-builder';
import {Events} from '../test-stream';
import {DEFAULT_SOURCE} from '../../../constants';
import { SQSClientStub } from './stubs/sqs-client.stub';

[
  {
    type: 'Stubbed Client',
    client: new SQSClientStub(),
    condition: () => true,
  },
].forEach(({type, client, condition}) => {
  describe(`SQS Connector: With ${type}`, () => {
    let producerApp: ProducerApp | undefined;
    let producerService: TestProducerService;
    let listenerStub: sinon.SinonStub;
    before(async function () {
      if (!condition()) {
        // eslint-disable-next-line  @typescript-eslint/no-invalid-this
        this.skip();
      }
      listenerStub = sinon.stub().resolves();
      if (client) {
        client.register(listenerStub);
      }
      producerApp = await setupProducerApplication(client);
      producerService = producerApp.getSync<TestProducerService>(
        `services.TestProducerService`,
      );

    });
    beforeEach(() => {
      listenerStub.reset();
    });
    after(async () => {
      await producerApp?.stop();
    });
    describe('Producer', () => {
      it('should produce an event for a particular topic', async () => {
        const data = {
          MessageBody: JSON.stringify({tenantId: '123', action: 'delete'}),
          MessageAttributes:{
             EventType: {
                 DataType: 'String',
                 StringValue: Events.A,
               },
          }
        }
        await producerService.produceEventA(data);
        sinon.assert.calledWithExactly(listenerStub,'type A', "Source A", data);
      });
      it('should produce multiple events for a particular topic', async () => {
        const data = [{
          Id:'1',
          MessageBody: JSON.stringify({tenantId: '123', action: 'delete'}),
          MessageAttributes:{
             EventType: {
                 DataType: 'String',
                 StringValue: Events.A,
               },
          }
        },
        {
          Id:'2',
          MessageBody: JSON.stringify({tenantId: '456', action: 'delete'}),
          MessageAttributes:{
             EventType: {
                 DataType: 'String',
                 StringValue: Events.B,
               },
          }
        }];
        await producerService.produceMultipleA(data);
        sinon.assert.calledWithExactly(listenerStub,'type A', "Source A", data);
      
      });
    });
  });
});
