import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {SQSConsumerProvider} from './sqs-consumer.provider';
import {Config} from './types';
import {SQSBindings} from './keys';
import {ILogger, LOGGER} from '@sourceloop/core';

@lifeCycleObserver()
export class SQSConsumerObserver implements LifeCycleObserver {
  private readonly consumers: SQSConsumerProvider[] = [];

  constructor(
    @inject(SQSBindings.Config)
    private readonly sqsConfig: Config,
    @inject(SQSBindings.SQSConsumerHandler, {optional: true})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly  sqsConsumerHandler: (message: any) => Promise<void>,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  async init(): Promise<void> {
    // Add your logic here to initialize the observer
  }
  /**
   * Start the lifecycle observer.
   * Create the specified number of consumers.
   */
  async start(): Promise<void> {
    const maxConsumers = this.sqsConfig.ConsumerConfig.maxConsumers ?? 1;
    for (let i = 0; i < maxConsumers; i++) {
      const consumer = new SQSConsumerProvider(
        this.sqsConfig,
        this.sqsConsumerHandler,
        this.logger,
      );
      consumer.value();
      this.consumers.push(consumer);
    }
  }

  /**
   * Stop all consumers when the application stops.
   */
  async stop(): Promise<void> {
    for (const consumer of this.consumers) {
      consumer.stop();
    }
  }
}
