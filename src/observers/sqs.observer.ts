import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {SqsConsumerService} from '../services';
import {SqsConfig} from '../sqstypes';
import {queueBindings} from '../keys';

/* It's a LifeCycleObserver that starts the SqsConsumerService
 when the application starts and stops
it when the application stops */
@lifeCycleObserver()
export class SQSObserver implements LifeCycleObserver {
  constructor(
    @inject(queueBindings.queueConfig, {optional: true})
    private readonly client: SqsConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(SqsConsumerService)
    private readonly sqsConsumerHandler: SqsConsumerService,
  ) {}

  async start(): Promise<void> {
    if (!this?.client?.initObservers) {
      this.logger.debug('SQS Observer is disabled.');
      return;
    }
    //  const consumersqs = this.sqsConsumerHandler.value();
    await this.sqsConsumerHandler.consume();
    this.logger.debug('SQS Observer has started.');
  }

  async stop(): Promise<void> {
    this.client.initObservers = false;
    this.logger.debug('SQS Observer has stopped!');
  }
}
