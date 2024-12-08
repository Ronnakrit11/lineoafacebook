import type { default as PusherType } from 'pusher';
import type { Message } from '@prisma/client';
import type { ConversationWithMessages } from '@/app/types/chat';
import { PUSHER_EVENTS, PUSHER_CHANNELS } from '../pusher';
import { formatMessageForPusher, formatConversationForPusher } from '../messageFormatter';

interface PusherEventParams {
  message: Message;
  conversation: ConversationWithMessages;
}

export async function sendPusherEvents(
  pusherServer: PusherType,
  params: PusherEventParams
) {
  const { message, conversation } = params;

  await Promise.all([
    pusherServer.trigger(
      PUSHER_CHANNELS.CHAT,
      PUSHER_EVENTS.MESSAGE_RECEIVED,
      formatMessageForPusher(message)
    ),
    pusherServer.trigger(
      PUSHER_CHANNELS.CHAT,
      PUSHER_EVENTS.CONVERSATION_UPDATED,
      formatConversationForPusher(conversation)
    )
  ]);
}