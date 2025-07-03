import {producer} from '../../../../../decorators';
import {Producer, QueueType} from '../../../../../types';
import {AnyObject} from '@loopback/repository';

export class TestProducerService {
  constructor(
    @producer(QueueType.SQS)
    private readonly prod: Producer,
  ) {}

  produceEventA(data: AnyObject) {
    return this.prod.send(data);
  }

  produceEventB(data: AnyObject) {
    return this.prod.send(data);
  }

  produceMultipleA(data: AnyObject[]) {
    return this.prod.sendMultiple(data);
  }
}
