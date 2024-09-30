import {expect} from '@loopback/testlab';
import {ILogger} from '@sourceloop/core';
import {Job, Queue} from 'bullmq';
import * as sinon from 'sinon';
import {BullMQConfig, IStreamDefinitionBullMQ} from '../../../bullmqtypes';
import {BullmqProducerFactoryProvider} from '../../../providers/bullmq-producer-factory.provider';
/**
 * Provides a factory for creating BullMQ producers that can add jobs to a queue.
 * The factory is configured with a BullMQConfig object that specifies the queue name, connection options, and other settings.
 * The factory can be used to produce jobs with various options such as delay and priority.
 * It also logs a message when a job is successfully added to the queue.
 */
describe('BullMQProducerFactory', () => {
  let bullMQProducerFactory: BullmqProducerFactoryProvider<IStreamDefinitionBullMQ>;
  let mockQueue: sinon.SinonStubbedInstance<Queue>;
  let mockLogger: sinon.SinonStubbedInstance<ILogger>;

  beforeEach(() => {
    mockQueue = sinon.createStubInstance(Queue);

    mockQueue.add.resolves({
      id: 'test-job-id',
      queue: {} as Queue,
      name: '',
      data: {},
      opts: {},
    } as unknown as Job<Object, Object, string>);

    mockLogger = {
      info: sinon.stub(),
    } as sinon.SinonStubbedInstance<ILogger>;

    const mockBullMQConfig: BullMQConfig = {
      initObservers: false,
      queueName: 'test-queue',
      queueOptions: {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
      workerOptions: {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
      connection: {
        host: 'localhost',
        port: 6379,
      },
    };

    bullMQProducerFactory = new BullmqProducerFactoryProvider(
      mockBullMQConfig,
      mockLogger,
    );
  });

  it('should add a job to the queue with correct parameters', async () => {
    const type = 'test-event';
    const payload = [{data: 'test-data'}];
    const options = {delay: 5, priority: 2};

    await bullMQProducerFactory.produce(type, payload, options);

    sinon.assert.calledWith(
      mockQueue.add,
      type,
      {event: type, data: {data: 'test-data'}},
      {
        delay: 5000,
        removeOnComplete: true,
        priority: 2,
      },
    );
  });

  it('should log a message after sending to the queue', async () => {
    const type = 'test-event';
    const payload = [{data: 'test-data'}];
    const options = {delay: 0, priority: 0};

    await bullMQProducerFactory.produce(type, payload, options);

    sinon.assert.calledWith(
      mockLogger.info,
      'Message sent to BullMQ queue with Job ID: test-job-id',
    );
  });

  it('should handle multiple payload items', async () => {
    const type = 'test-event';
    const payload = [{data: 'test-data-1'}, {data: 'test-data-2'}];
    const options = {delay: 0, priority: 0};

    await bullMQProducerFactory.produce(type, payload, options);

    sinon.assert.calledTwice(mockQueue.add);
  });

  it('should use default delay of 0 when not provided', async () => {
    const type = 'test-event';
    const payload = [{data: 'test-data'}];

    await bullMQProducerFactory.produce(type, payload, {delay: 0, priority: 0});

    sinon.assert.calledWith(
      mockQueue.add,
      sinon.match.string,
      sinon.match.any,
      sinon.match({delay: 0}),
    );
  });

  it('should handle errors when adding to the queue', async () => {
    const type = 'test-event';
    const payload = [{data: 'test-data'}];
    const options = {delay: 0, priority: 0};
    mockQueue.add.rejects(new Error('Queue error'));

    await expect(
      bullMQProducerFactory.produce(type, payload, options),
    ).to.be.rejectedWith('Queue error');
  });
});
