export enum Events {
  A = 'A',
  B = 'B',
}
export interface TestStream {
  [Events.A]: {
    name: 'Event A';
    data: string;
    type?: Events;
  };
  [Events.B]: {
    name: 'Event B';
    data: number;
    type?: Events;
  };
}
