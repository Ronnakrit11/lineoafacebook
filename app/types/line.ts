import type { WebhookEvent, TextEventMessage, EventBase } from '@line/bot-sdk';

interface BaseSource {
  type: string;
  userId?: string;
}

interface UserSource extends BaseSource {
  type: 'user';
  userId: string;
}

interface GroupSource extends BaseSource {
  type: 'group';
  groupId: string;
}

interface RoomSource extends BaseSource {
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
  webhookEventId: string;
  deliveryContext: {
    isRedelivery: boolean;
  };
}

export function isTextMessageEvent(event: WebhookEvent): event is LineTextMessageEvent {
  if (event.type !== 'message') return false;
  if (!('message' in event)) return false;
  if (event.message.type !== 'text') return false;
  if (!('source' in event)) return false;
  if (!('webhookEventId' in event)) return false;
  if (!('deliveryContext' in event)) return false;

  const source = event.source;
  return (
    (source.type === 'user' && 'userId' in source) ||
    (source.type === 'group' && 'groupId' in source) ||
    (source.type === 'room' && 'roomId' in source)
  );
}