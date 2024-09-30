import {AnyObject} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {ILogger} from '@sourceloop/core';
import {Job} from 'bullmq';
import * as sinon from 'sinon';
import {BullMQConfig, BullMQMessage} from '../../../bullmqtypes';
import {BullMQConsumerService} from '../../../services/bullmq-consumer.service';

describe('BullMQConsumerService', () => {
  let bullMQConsumerService: BullMQConsumerService;
  let mockLogger: sinon.SinonStubbedInstance<ILogger>;
  let mockConsumerMap: Map<string, AnyObject>;

  /**
   * Initializes the BullMQConsumerService with mock dependencies for testing.
   * - Sets up a mock logger with stubs for info, error, and warn methods.
   * - Creates a new Map to store mock consumers.
   * - Initializes a mock BullMQConfig object.
   * - Creates a new BullMQConsumerService instance with the mock dependencies.
   * - Assigns the mock consumer map to the consumerMap property of the BullMQConsumerService instance.
   */
  beforeEach(() => {
    mockLogger = {
      info: sinon.stub(),
    } as sinon.SinonStubbedInstance<ILogger>;
    mockConsumerMap = new Map();
    const mockClientConfig = {
      connection: {
        host: 'localhost',
        port: 6379,
      },
      initObservers: false,
      queueName: 'mockQueue',
      queueOptions: {},
      workerOptions: {},
    } as BullMQConfig; // Mock BullMQConfig

    const mockGetter = () => Promise.resolve([]);
    bullMQConsumerService = new BullMQConsumerService(
      mockGetter,
      mockClientConfig,
      mockLogger,
    );
    (bullMQConsumerService as AnyObject).consumerMap = mockConsumerMap;
  });

  it('should process job successfully when consumer exists', async () => {
    const mockJob = {
      id: 'test-job-id',
      name: 'test-event',
      data: {testData: 'data'},
      opts: {jobId: 'test-job-id'},
    } as Job;

    const mockConsumer = {
      handler: sinon.stub().resolves(),
    };

    mockConsumerMap.set('test-event:test-job-id', mockConsumer);

    await (bullMQConsumerService as AnyObject).processJob(mockJob);

    expect(mockConsumer.handler.calledOnce).to.be.true();
    expect(
      mockLogger.info.calledWith(
        `Processed job test-job-id for event test-event`,
      ),
    ).to.be.true();
  });

  it('should log warning when consumer does not exist', async () => {
    const mockJob = {
      id: 'test-job-id',
      name: 'non-existent-event',
      data: {testData: 'data'},
      opts: {jobId: 'test-job-id'},
    } as Job;

    await (bullMQConsumerService as AnyObject).processJob(mockJob);

    expect(
      mockLogger.warn.calledWith(`UnhandledEvent: non-existent-event`),
    ).to.be.true();
  });

  it('should throw and log error when processing fails', async () => {
    const mockJob = {
      id: 'test-job-id',
      name: 'test-event',
      data: {testData: 'data'},
      opts: {jobId: 'test-job-id'},
    } as Job;

    const mockError = new Error('Processing failed');
    const mockConsumer = {
      handler: sinon.stub().rejects(mockError),
    };

    mockConsumerMap.set('test-event:test-job-id', mockConsumer);

    await expect(
      (bullMQConsumerService as AnyObject).processJob(mockJob),
    ).to.be.rejectedWith('Processing failed');
    expect(
      mockLogger.error.calledWith(
        `ProcessingFailed: ${JSON.stringify(mockError)}`,
      ),
    ).to.be.true();
  });
  it('should handle job without ID', async () => {
    const mockJob = {
      name: 'test-event',
      data: {testData: 'data'},
      opts: {},
    } as Job;

    const mockConsumer = {
      handler: sinon.stub().resolves(),
    };

    mockConsumerMap.set('test-event:', mockConsumer);

    await (BullMQConsumerService as AnyObject).processJob(mockJob);

    const expectedMessage: BullMQMessage = {
      id: '',
      data: {testData: 'data'},
      name: 'test-event',
    };

    expect(
      mockConsumer.handler.calledWith(mockJob.data, expectedMessage),
    ).to.be.true();
  });
});
