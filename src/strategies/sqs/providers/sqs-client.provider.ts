import {SQSClient} from '@aws-sdk/client-sqs';
import {Provider, inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {SQSBindings} from '../keys';
import {Config} from '../types';

export class SQSClientProvider implements Provider<SQSClient> {
  constructor(
    @inject(SQSBindings.Config, {optional: true})
    private readonly config: Config,
  ) {}
  value() {
    if (!this.config)
      throw new HttpErrors.PreconditionFailed('AWS SQS Config missing !');

    return new SQSClient({
      region: this.config['Credentials'].region,
      credentials: {
        accessKeyId: this.config['Credentials'].accessKeyId,
        secretAccessKey: this.config['Credentials'].secretAccessKey,
      },
    });
  }
}
