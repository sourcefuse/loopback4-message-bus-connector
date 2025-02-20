// export interface SqsClientOptions {
//   clientConfig: SQSClientConfig;
//   queueUrls?: string[];
//   initObservers?: boolean;
// }

// export type SqsSendMessageOptions = {
//   delaySeconds?: number;
//   messageAttributes?: Record<string, MessageAttributeValue>;
//   messageDeduplicationId?: string;
// };

// /**
//  * Sqs message without stringifed body
//  * */
// export type SqsMessage = Omit<Message, 'Body'>;

// export interface QueueHandler<T = unknown> {
//   groupId?: string;
//   event: string;
//   produce?(payload: T): Promise<void>;
//   consume?(payload: T, message: SqsMessage): Promise<void>;
// }

// /**
//  * consumer interface for sqs
//  * */
// export interface SqsConsumer<Payload = {}> {
//   /*
//    * subscribed group id for consumer
//    * */
//   groupId?: string;
//   /**
//    * subscribed event
//    * */
//   event: string;
//   /**
//    * handler will be called when a message is received for configured groupId and event name
//    * @param payload - parsed json object from sqs message body
//    * @param message - sqs message object without string body
//    * */
//   handler(payload: Payload, message: SqsMessage): Promise<void>;
// }

// //==================================================================================New types
// import {
//   Message,
//   MessageAttributeValue,
//   SQSClient,
//   SQSClientConfig,
// } from '@aws-sdk/client-sqs';

// //SQS connector
// export interface AwsSQSClientConfig {
//   region: string;
//   credentials: {
//     accessKeyId: string;
//     secretAccessKey: string;
//   };
// }

// //SQS config
// export interface SqsConfig {
//   queueType: 'SQS';
//   initObservers: boolean;
//   SqsClient: SQSClient;
//   clientConfig?: SQSClientConfig;
//   queueUrls: string[];
//   maxNumberOfMessages?: number;
//   waitTimeSeconds?: number;
//   DelaySeconds?: number;
//   groupIds?: string[];
//   sqsType: 'standard' | 'fifo';
// }

// //For sending message to sqs
// export interface SqsSendMessage<T = string> {
//   DelaySeconds?: number;
//   MessageAttributes?: MessageAttributeValue;
//   body: T;
//   MessageDeduplicationId?: string; // Required for FIFO queues
//   MessageGroupId?: string; // Required for FIFO queues
//   QueueUrl: string;
// }

// // Standard DataTypes
// type StandardDataType = 'String' | 'Number' | 'Binary';

// // Custom DataType extensions for Number and Binary
// type NumberCustomType = `${'Number'}.${'byte' | 'short' | 'int' | 'float'}`;
// type BinaryCustomType = `${'Binary'}.${'gif' | 'png' | 'jpg'}`;

// // Full DataType definition combining standard and custom types
// export type DataType = StandardDataType | NumberCustomType | BinaryCustomType;

// // Generic SqsMessageAttribute with custom DataType support
// export type SqsMessageAttribute<T extends string = string> = {
//   [K in T]: {
//     DataType: DataType; // Use the combined DataType
//     StringValue: string;
//   };
// };

// //For receive message from sqs
// export interface SqsReceiveMessage {
//   AttributeNames?: string[];
//   MaxNumberOfMessages?: number;
//   MessageAttributeNames?: string[];
//   QueueUrl: string;
//   VisibilityTimeout?: number;
//   WaitTimeSeconds?: number;
// }

// //For delete message from sqs
// export interface SqsDeleteMessage {
//   QueueUrl: string;
//   ReceiptHandle: string;
// }
