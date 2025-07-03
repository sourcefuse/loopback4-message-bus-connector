import {BindingScope, inject, injectable} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {EventBridgeClient, PutEventsCommand} from '@aws-sdk/client-eventbridge';
import {DEFAULT_EVENT_BUS_NAME, DEFAULT_SOURCE} from '../../../constants';
import {EventBridgeStreamConfig, EventBridgeStreamBindings} from '../keys';
import {Producer} from '../../../types';

@injectable({
  scope: BindingScope.TRANSIENT,
})
export class EventBridgeProducerService<Stream extends AnyObject = AnyObject>
  implements Producer<Stream>
{
  private source: string = DEFAULT_SOURCE;
  private eventBusName: string;

  constructor(
    @inject(EventBridgeStreamBindings.Client)
    private readonly client: EventBridgeClient,
    @inject(EventBridgeStreamBindings.Config)
    private readonly config: EventBridgeStreamConfig,
  ) {
    this.source = config.source ?? DEFAULT_SOURCE;
    this.eventBusName =
      config.eventBusName ??
      process.env.EVENT_BUS_NAME ??
      DEFAULT_EVENT_BUS_NAME;
  }

  async send<Event extends keyof Stream>(
    data: Stream[Event],
    topic?: Event,
  ): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(data),
            DetailType: topic as string,
            Source: this.source,
            EventBusName: this.eventBusName,
          },
        ],
      }),
    );
  }

  async sendMultiple<Event extends keyof Stream>(
    data: Stream[Event][],
  ): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: data.map(entry => ({
          Detail: JSON.stringify(entry),
          DetailType: entry.type,
          Source: this.source,
          EventBusName: this.eventBusName,
        })),
      }),
    );
  }
}
