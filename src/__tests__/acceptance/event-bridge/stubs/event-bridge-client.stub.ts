import {PutEventsCommand} from '@aws-sdk/client-eventbridge';
import {StubListener} from '../types';

export class EventBridgeStub {
  listener?: StubListener;
  register(listener: StubListener) {
    this.listener = listener;
  }

  send(command: PutEventsCommand) {
    if (!this.listener) {
      throw new Error('Listener not registered');
    }
    const {Entries} = command.input;
    if (!Entries) {
      return;
    }
    for (const entry of Entries) {
      const {Detail, Source, DetailType} = entry;
      if (!DetailType || !Source) {
        return;
      }
      this.listener(DetailType, Source, JSON.parse(Detail ?? '{}'));
    }
    return {
      $metadata: {},
    };
  }
}
