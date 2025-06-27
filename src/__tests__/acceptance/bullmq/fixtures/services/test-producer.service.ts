import {producer} from '../../../../../decorators';
import {Producer, QueueType} from '../../../../../types';
import {Events, TestStream} from '../../../test-stream';

export class TestProducerService {
  constructor(
    @producer(QueueType.BullMQ)
    private readonly prod: Producer<TestStream>,
  ) {}

  produceEventA(data: string) {
    return this.prod.send({
      name: 'Event A',
      data,
      type: Events.A,
    });
  }

  produceEventB(data: number) {
    return this.prod.send({
      name: 'Event B',
      data,
      type: Events.B,
    });
  }

  produceMultipleA(data: string[]) {
    return this.prod.sendMultiple(
      data.map(d => ({name: 'Event A', data: d, type: Events.A})),
    );
  }
}
