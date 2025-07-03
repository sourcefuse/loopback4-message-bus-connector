import {StubListener} from '../types';

export interface SQSCommand {
  input: {
    MessageBody: string;
    MessageAttributes?: Record<string, string>;
    Entries?: {
      MessageBody: string;
      MessageAttributes?: Record<string, string>;
    }[];
  };
}
export class SQSClientStub {
  listener?: StubListener;
  register(listener: StubListener) {
    this.listener = listener;
  }

  send(command: SQSCommand) {
    if (!this.listener) {
      throw new Error('Listener not registered');
    }
    if (command.input.Entries) {
      this.listener(
        'type A',
        'Source A',
        JSON.parse(JSON.stringify(command.input.Entries)),
      );
    } else {
      this.listener('type A', 'Source A', {
        MessageBody: command.input.MessageBody,
        MessageAttributes: command.input.MessageAttributes,
      });
    }

    return {
      $metadata: {},
    };
  }
}
