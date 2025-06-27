import {BullMqQueueParams, StubListener} from '../types';
import {QueueOptions} from 'bullmq';

export class QueueStub {
  listener?: StubListener;
  register(listener: StubListener) {
    this.listener = listener;
  }
  opts: QueueOptions = {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  };
  name: string = process.env.QUEUE_NAME ?? 'default-queue';

  add(
    name: string,
    data: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) {
    if (!this.listener) {
      throw new Error('Listener not registered');
    }
    this.listener(name, data as unknown as string, options ?? {});
    return {
      $metadata: {},
    };
  }

  addBulk(payload: BullMqQueueParams[]) {
    if (!this.listener) {
      throw new Error('Listener not registered');
    }

    this.listener(JSON.stringify(payload), '', {});

    return {
      $metadata: {},
    };
  }
}
