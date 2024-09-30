import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {BullMQClientBindings} from '../bullmqkeys';
import {BullMQConfig} from '../bullmqtypes';
import {BullMQConsumerService} from '../services';

/* LifeCycleObserver that starts the BullmqConsumerService
   when the application starts and stops it when the application stops */
@lifeCycleObserver()
export class BullMQObserver implements LifeCycleObserver {
  constructor(
    @inject(BullMQClientBindings.BullMQClient)
    private client: BullMQConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(BullMQConsumerService) private consumer: BullMQConsumerService,
  ) {}

  async start(): Promise<void> {
    if (!this.client.initObservers) {
      this.logger.debug('BullMQ Observer is disabled.');
      return;
    }
    await this.consumer.consume();
    this.logger.debug('BullMQ Observer has started.');
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
    this.logger.debug('BullMQ Observer has stopped!');
  }
}
