import {lifeCycleObserver, LifeCycleObserver, service} from '@loopback/core';
import {SQSConsumerService} from '../services';

@lifeCycleObserver()
export class SQSConsumerObserver implements LifeCycleObserver {
  constructor(
    @service(SQSConsumerService)
    private readonly sqsConsumerService: SQSConsumerService,
  ) {}

  async init(): Promise<void> {
    // Add your logic here to initialize the observer
  }
  /**
   * Start the lifecycle observer.
   * Create the specified number of consumers.
   */
  async start(): Promise<void> {
    await this.sqsConsumerService.startConsumer();
  }

  /**
   * Stop all consumers when the application stops.
   */
  async stop(): Promise<void> {
    this.sqsConsumerService.stop();
  }
}
