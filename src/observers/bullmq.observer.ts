import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {BullMQConfig} from '../bullmqtypes';
import {BullMQConsumerService} from '../services';
import {queueBindings} from '../keys';

/* LifeCycleObserver that starts the BullmqConsumerService
   when the application starts and stops it when the application stops */
@lifeCycleObserver()
export class BullMQObserver implements LifeCycleObserver {
  constructor(
    @inject(queueBindings.queueConfig, {optional: true})
    private readonly client: BullMQConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(BullMQConsumerService)
    private readonly bullmqconsumer: BullMQConsumerService,
  ) {}

  async start(): Promise<void> {
    if (!this?.client?.initObservers) {
      this.logger.debug('BullMQ Observer is disabled.');
      return;
    }
    await this.bullmqconsumer.consume();
    this.logger.debug('BullMQ Observer has started.');
  }

  async stop(): Promise<void> {
    await this.bullmqconsumer.stop();
    this.logger.debug('BullMQ Observer has stopped!');
  }
}
