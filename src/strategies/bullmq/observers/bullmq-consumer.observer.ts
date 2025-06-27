import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {BullMQConsumerService} from '../services/bullmq-consumer.service';
import {BullMQBindings} from '../keys';

@lifeCycleObserver()
export class BullMQConsumerObserver implements LifeCycleObserver {
  constructor(
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @inject(BullMQBindings.BullMQConsumer.key)
    private readonly bullMQConsumerService: BullMQConsumerService,
  ) {}

  async init(): Promise<void> {
    this.logger.info('All consumers initialised.');
  }

  /**
   * Start the lifecycle observer.
   * Create the specified number of consumers.
   */
  async start(): Promise<void> {
    this.bullMQConsumerService.start();

    this.logger.info(`consumers started.`);
  }

  /**
   * Stop all consumers when the application stops.
   */
  async stop(): Promise<void> {
    this.bullMQConsumerService.stop();

    this.logger.info('All consumers stopped.');
  }
}
