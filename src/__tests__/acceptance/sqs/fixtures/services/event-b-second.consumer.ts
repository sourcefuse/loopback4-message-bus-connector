import {inject} from '@loopback/core';
import {consumer} from '../../../../../decorators';
import {IConsumer, QueueType} from '../../../../../types';
import {Events, TestStream} from '../../../test-stream';

@consumer
export class EventBSecondConsumer implements IConsumer<TestStream, Events.B> {
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
