import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {BullMQConsumerProvider} from './bullmq-consumer.provider';
import {BullMQBindings} from './keys';
import {Config} from './types';
import {Queue} from 'bullmq';
import {ILogger, LOGGER} from '@sourceloop/core';

@lifeCycleObserver()
export class BullMQConsumerObserver implements LifeCycleObserver {
  private readonly consumers: BullMQConsumerProvider[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queue: Queue<any, any, string>;

  constructor(
    @inject(BullMQBindings.Config)
    private readonly bullMQConfig: Config,
    @inject(BullMQBindings.BullMQConsumerHandler, {optional: true})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly  bullMQConsumerHandler: (message: any) => Promise<void>,

    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  async init(): Promise<void> {
    if (!this.bullMQConfig) {
      this.logger.error('BullMQ configuration is missing!');
      throw new Error('BullMQ configuration is missing!');
    }
    this.queue = new Queue(this.bullMQConfig.QueueName, {
      connection: this.bullMQConfig.redisConfig,
    });
  }

  /**
   * Start the lifecycle observer.
   * Create the specified number of consumers.
   */
  async start(): Promise<void> {
    const consumer = new BullMQConsumerProvider(
      this.bullMQConfig,
      this.queue,
      this.bullMQConsumerHandler,
      this.logger,
    );
    consumer.value();

    this.logger.info(`${this.consumers.length} consumers started.`);
  }

  /**
   * Stop all consumers when the application stops.
   */
  async stop(): Promise<void> {
    for (const consumer of this.consumers) {
      consumer.stop();
    }

    this.logger.info('All consumers stopped.');
  }
}
