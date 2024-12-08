import axios from 'axios';
import { PrismaClient } from '@prisma/client';

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

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: message,
          sender: 'USER',
          platform: 'FACEBOOK'
        }
      });

      await sendFacebookMessage(senderId, 'ได้รับข้อความของคุณแล้ว');
    }
  }
}

export async function sendFacebookMessage(recipientId: string, messageText: string) {
  try {
    await axios.post(FACEBOOK_GRAPH_API, {
      recipient: { id: recipientId },
      message: { text: messageText },
      access_token: PAGE_ACCESS_TOKEN
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error sending Facebook message:', error);
  }
}