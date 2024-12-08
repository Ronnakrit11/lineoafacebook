import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from './pusher';
import { formatMessageForPusher, formatConversationForPusher } from './messageFormatter';

const prisma = new PrismaClient();

const FACEBOOK_GRAPH_API = 'https://graph.facebook.com/v17.0/me/messages';
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

interface FacebookWebhookEntry {
  id: string;
  messaging: Array<{
    sender: {
      id: string;
    };
    message: {
      text: string;
    };
  }>;
}

interface FacebookWebhookBody {
  object: string;
  entry: FacebookWebhookEntry[];
}

export async function handleFacebookWebhook(body: FacebookWebhookBody) {
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;
      const message = webhookEvent.message.text;

      let conversation = await prisma.conversation.findFirst({
        where: {
          userId: senderId,
          platform: 'FACEBOOK'
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: senderId,
            platform: 'FACEBOOK',
            channelId: entry.id
          }
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: message,
          sender: 'USER',
          platform: 'FACEBOOK'
        }
      });

      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (updatedConversation) {
        await Promise.all([
          pusherServer.trigger(
            PUSHER_CHANNELS.CHAT,
            PUSHER_EVENTS.MESSAGE_RECEIVED,
            formatMessageForPusher(newMessage)
          ),
          pusherServer.trigger(
            PUSHER_CHANNELS.CHAT,
            PUSHER_EVENTS.CONVERSATION_UPDATED,
            formatConversationForPusher(updatedConversation)
          ),
        ]);
      }
    }
  }
}

export async function sendFacebookMessage(recipientId: string, messageText: string): Promise<boolean> {
  if (!recipientId || !messageText || !PAGE_ACCESS_TOKEN) {
    console.error('Missing required parameters for Facebook message');
    return false;
  }

  try {
    await axios.post(
      FACEBOOK_GRAPH_API,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    return false;
  }
}