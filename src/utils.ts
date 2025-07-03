import {QueueType} from './types';

export function producerKeyForQueue(queue: QueueType): string {
  const queueName = QueueType[queue]?.toLowerCase();
  if (!queueName) {
    throw new Error(`Invalid or unsupported queue type: ${queue}`);
  }
  return `sf.producer.${queueName}`;
}
