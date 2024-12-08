import type { WebhookEvent, TextEventMessage, EventBase } from '@line/bot-sdk';

export interface BaseSource {
  type: string;
  userId?: string;
}

export interface UserSource extends BaseSource {
  type: 'user';
  userId: string;
}

export interface GroupSource extends BaseSource {
  type: 'group';
  groupId: string;
}

export interface RoomSource extends BaseSource {
  type: 'room';
  roomId: string;
}

export type LineSource = UserSource | GroupSource | RoomSource;

export interface LineTextMessageEvent extends EventBase {
  type: 'message';
  message: TextEventMessage;
  source: LineSource;
  replyToken: string;
  mode: 'active' | 'standby';
}

export function isTextMessageEvent(event: WebhookEvent): event is LineTextMessageEvent {
  if (event.type !== 'message') return false;
  if (!('message' in event)) return false;
  if (event.message.type !== 'text') return false;
  
  const source = event.source;
  if (!source) return false;

  switch (source.type) {
    case 'user':
      return 'userId' in source;
    case 'group':
      return 'groupId' in source;
    case 'room':
      return 'roomId' in source;
    default:
      return false;
  }
}