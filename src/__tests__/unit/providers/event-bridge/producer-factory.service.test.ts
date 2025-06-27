import {expect, sinon} from '@loopback/testlab';
import {
  EventBridge,
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import {EventBridgeStreamConfig} from '../../../../strategies';
import {EventBridgeProducerService} from '../../../../strategies/event-bridge/services';
describe('ProducerFactoryProvider', () => {
  let mockClient: sinon.SinonStubbedInstance<EventBridgeClient>;
  let producer: EventBridgeProducerService;

  const mockConfig: EventBridgeStreamConfig = {
    source: 'test-source',
    eventBusName: 'test-bus',
  };

  beforeEach(() => {
    mockClient = sinon.createStubInstance(EventBridgeClient);
    producer = new EventBridgeProducerService(
      mockClient as unknown as EventBridgeClient,
      mockConfig,
    );
  });

  it('should send a single event with correct parameters', async () => {
    const data = {id: 1, message: 'test'};
    const topic = 'MyEvent';

    await producer.send(data, topic);

    sinon.assert.calledOnce(mockClient.send);
    const commandArg = mockClient.send.firstCall.args[0] as PutEventsCommand;

    expect(commandArg.input.Entries).to.have.length(1);
    expect(commandArg.input.Entries?.[0]).to.containDeep({
      Detail: JSON.stringify(data),
      DetailType: topic,
      Source: 'test-source',
      EventBusName: 'test-bus',
    });
  });

  it('should send multiple events with correct parameters', async () => {
    const data = [{msg: 'one',type: 'BatchEvent'}, {msg: 'two', type: 'BatchEvent'}];
    const topic = 'BatchEvent';

    await producer.sendMultiple(data);

    sinon.assert.calledOnce(mockClient.send);
    const commandArg = mockClient.send.firstCall.args[0] as PutEventsCommand;

    expect(commandArg.input.Entries).to.have.length(2);
    expect(commandArg.input.Entries?.[0]).to.containDeep({
      Detail: JSON.stringify(data[0]),
      DetailType: topic,
      Source: 'test-source',
      EventBusName: 'test-bus',
    });
    expect(commandArg.input.Entries?.[1]).to.containDeep({
      Detail: JSON.stringify(data[1]),
      DetailType: topic,
      Source: 'test-source',
      EventBusName: 'test-bus',
    });
  });
});
