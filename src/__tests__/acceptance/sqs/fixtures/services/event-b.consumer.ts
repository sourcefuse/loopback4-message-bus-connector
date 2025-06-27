import {inject} from '@loopback/core';
import {IConsumer, QueueType} from '../../../../../types';
import {Events, TestStream} from '../../../test-stream';
import {consumer} from '../../../../../decorators';

@consumer
export class EventBConsumer implements IConsumer<TestStream, Events.B> {
  constructor(
    @inject('consumer.stub')
    private readonly stub: sinon.SinonStub,
  ) {}
  event: Events.B = Events.B;
  queue: QueueType = QueueType.SQS;
  async handle(data: {name: 'Event B'; data: number}): Promise<void> {
    this.stub(data);
  }
}
