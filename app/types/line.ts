import type { WebhookEvent, TextEventMessage, EventBase } from '@line/bot-sdk';

// Define the specific source types that LINE API can return
interface UserSource {
  type: 'user';
  userId: string;
}

interface GroupSource {
  type: 'group';
  groupId: string;
  userId?: string;
}

interface RoomSource {
  type: 'room';
  roomId: string;
  userId?: string;
}

// Union type of all possible source types
type LineSource = UserSource | GroupSource | RoomSource;

// Extend the base event type to include all required properties
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
  if (
    event.type !== 'message' ||
    !('message' in event) ||
    event.message.type !== 'text' ||
    !('source' in event) ||
    !('webhookEventId' in event) ||
    !('deliveryContext' in event)
  ) {
    return false;
  }

  const source = event.source;
  return (
    (source.type === 'user' && 'userId' in source) ||
    (source.type === 'group' && 'groupId' in source) ||
    (source.type === 'room' && 'roomId' in source)
  );
}