import {extensionPoint, extensions, Getter} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {EventHandlerExtensionPoint} from '../keys';
import {IConsumer, QueueType} from '../types';

@extensionPoint(EventHandlerExtensionPoint.key)
export class EventHandlerService<Stream extends AnyObject = AnyObject> {
  constructor(
    @extensions()
    private readonly getConsumers: Getter<IConsumer<AnyObject, string>[]>,
  ) {}

  async handle<Event extends keyof Stream>(
    event: Event,
    data: Stream[Event],
    queue: QueueType,
  ) {
    const consumers = await this.getConsumers();
    await Promise.all(
      consumers
        .filter(
          consumer => consumer.event === event && consumer.queue === queue,
        )
        .map(consumer => consumer.handle(data)),
    );
  }
}
