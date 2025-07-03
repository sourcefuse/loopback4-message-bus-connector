import {post, param, requestBody} from '@loopback/rest';
import {inject, service} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {EventHandlerService} from '../../../services';
import {
  CONTENT_TYPE,
  ILogger,
  LOGGER,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
} from '@sourceloop/core';
import {authorize} from 'loopback4-authorization';
import {QueueType} from '../../../types';

export class EventController {
  constructor(
    @service(EventHandlerService)
    private eventHandler: EventHandlerService,
    @inject(LOGGER.LOGGER_INJECT)
    private logger: ILogger,
  ) {}

  @authorize({permissions: ['*']})
  @post('event-bridge/events/{eventType}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Success',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              type: 'object',
              properties: {
                success: {type: 'boolean'},
              },
            },
          },
        },
      },
    },
  })
  async handleEvent(
    @param.path.string('eventType') eventType: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    })
    body: AnyObject,
  ): Promise<object> {
    await this.eventHandler.handle(eventType, body, QueueType.EventBridge);
    return {success: true};
  }
}
