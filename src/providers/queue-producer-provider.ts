import {inject, Provider} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {QueueBindings} from '../keys';
import {IQueueProducer, Message, QueueType} from '../types';
export class QueueProducerProvider implements Provider<IQueueProducer> {
  constructor(
    @inject(QueueBindings.SQSProducerProvider, {optional: true})
    private readonly sqsProvider?: IQueueProducer,
    @inject(QueueBindings.BullMQProducerProvider, {optional: true})
    private readonly bullMQProvider?: IQueueProducer,
  ) {}

  send(data: Message) {
    if (data.type === QueueType.SQS && this.sqsProvider) {
      return this.sqsProvider.send(data);
    } else if (data.type === QueueType.BullMQ && this.bullMQProvider) {
      return this.bullMQProvider.send(data);
    } else {
      throw new HttpErrors.UnprocessableEntity('Provider not found.');
    }
  }

  value() {
    return {
      send: async (message: Message) => this.send(message),
    };
  }
}
