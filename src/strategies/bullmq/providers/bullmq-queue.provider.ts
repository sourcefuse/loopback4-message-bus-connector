import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {Queue} from 'bullmq';
import {BullMQBindings} from '../keys';
import {BullMQConfig} from '../types';
import {HttpErrors} from '@loopback/rest';

export class BullMQQueueProvider implements Provider<Queue> {
  constructor(
    @inject(BullMQBindings.Config)
    private readonly bullConfig: BullMQConfig,
  ) {}
  value(): ValueOrPromise<Queue> {
    if (!this.bullConfig?.QueueName) {
      throw new HttpErrors.PreconditionFailed(
        'BullMQ Config missing or invalid!',
      );
    }
    return new Queue(this.bullConfig.QueueName, {
      connection: this.bullConfig.redisConfig,
      defaultJobOptions: this.bullConfig.producerConfig?.defaultJobOptions,
    });
  }
}
