import {inject} from '@loopback/core';
import {consumer} from '../../../../../decorators';
import {IConsumer, QueueType} from '../../../../../types';
import {Events, TestStream} from '../../../test-stream';

@consumer
export class EventAConsumer implements IConsumer<TestStream, Events.A> {
  constructor(
    @inject('consumer.stub')
    private readonly stub: sinon.SinonStub,
  ) {}
  event: Events.A = Events.A;
  queue: QueueType = QueueType.EventBridge;
  async handle(data: {name: 'Event A'; data: string}): Promise<void> {
    this.stub(data);
  }
}
