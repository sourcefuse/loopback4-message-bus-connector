import {BindingScope, inject, injectable} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Queue} from 'bullmq';
import {Producer} from '../../../types';
import {BullMQBindings} from '../keys';
import {BullMQConfig} from '../types';

/**
 * A service that provides methods to send messages to a BullMQ queue.
 */
@injectable({
  scope: BindingScope.TRANSIENT,
})
export class BullMQProducerService implements Producer {
  constructor(
    @inject(BullMQBindings.Config)
    private readonly bullConfig: BullMQConfig,
    @inject(BullMQBindings.BullMQQueue, {optional: true})
    private readonly queue: Queue,
    @inject(LOGGER.LOGGER_INJECT, {optional: true})
    private readonly logger: ILogger,
  ) {}

  async send(data: {
    name: string;
    data: Record<string, unknown>;
    options?: {
      delay?: number;
      priority?: number;
      [key: string]: unknown;
    };
  }): Promise<void> {
    await this.queue.add(data.name, data.data, data.options);
    return;
  }

  async sendMultiple(
    data: Array<{
      name: string;
      data: Record<string, unknown>;
      options?: {
        delay?: number;
        priority?: number;
        [key: string]: unknown;
      };
    }>,
  ): Promise<void> {

      await this.queue.addBulk(data);

  }
}
