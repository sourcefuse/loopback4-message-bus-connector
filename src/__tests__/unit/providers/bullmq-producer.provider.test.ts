import {expect, sinon} from '@loopback/testlab';
import {ILogger} from '@sourceloop/core';
import {Queue, QueueOptions, WorkerOptions} from 'bullmq';
import {BullMQConfig, BullMQSendMessage} from '../../../bullmqtypes';
import {ErrorKeys} from '../../../error-keys';
import {BullmqProducerProvider} from '../../../providers/bullmq-producer.provider';

describe('BullmqProducerProvider', () => {
  let queueStub: sinon.SinonStubbedInstance<Queue>;
  let provider: BullmqProducerProvider;
  let loggerStub: sinon.SinonStubbedInstance<ILogger>;
  let bullMQConfig: sinon.SinonStubbedInstance<BullMQConfig>;

  beforeEach(() => {
    // Create a stubbed instance of the Queue
    queueStub = sinon.createStubInstance(Queue);

    // Create a stubbed instance of the logger
    loggerStub = loggerStub = {
      info: sinon.stub(),
      error: sinon.stub(),
    } as sinon.SinonStubbedInstance<ILogger>;

    bullMQConfig = {
      queueType: 'BullMQ',
      initObservers: true,
      queueName: 'test-queue',
      connection: {
        host: 'localhost',
        port: 6379,
      },
      queueOptions: {} as QueueOptions,
      workerOptions: {} as WorkerOptions,
      delay: 5,
      removeOnComplete: true,
      groupId: 'test-group',
    };
    provider = new BullmqProducerProvider(bullMQConfig, loggerStub);

    // Replace the real queue with the stub
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (provider as any).queue = queueStub;
  });

  it('should send a message to BullMQ queue successfully', async () => {
    const message: BullMQSendMessage = {
      name: 'test-job',
      body: 'Test Message',
      MessageGroupId: 'group1',
    };

    const job = {
      id: '12345',
      data: {body: message.body, name: message.name},
      name: message.name,
    };

    // Stub the add method of Queue to resolve with a job result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queueStub.add.resolves(job as any);

    // Call the value method which returns the producer
    const producer = provider.value();

    // Send the message
    await producer.send(message);

    // Assertions
    sinon.assert.calledWith(
      queueStub.add,
      'test-job',
      sinon.match({
        groupId: 'group1',
        body: 'Test Message',
      }),
    );

    sinon.assert.calledWith(
      loggerStub.info,
      `Message sent to BullMQ queue with Job ID: ${job.id}`,
    );
  });

  it('should throw an error when BullMQ send fails', async () => {
    const message: BullMQSendMessage = {
      name: 'test-job',
      body: 'Test Message',
      MessageGroupId: 'group1',
    };

    const error = new Error('BullMQ send failed');

    // Stub the add method of Queue to reject with an error
    queueStub.add.rejects(error);

    // Call the value method which returns the producer
    const producer = provider.value();

    // Expect the producer to throw an error when sending the message
    await expect(producer.send(message)).to.be.rejectedWith(
      'BullMQ send failed',
    );

    // Assert that the logger logged the error message
    sinon.assert.calledWith(
      loggerStub.error,
      `${ErrorKeys.PublishFailed}: ${error.message}`,
    );
  });
});
