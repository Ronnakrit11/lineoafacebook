import { Client } from '@line/bot-sdk';

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

export const lineClient = new Client(lineConfig);

export async function sendLineMessage(userId: string, message: string): Promise<boolean> {
  try {
    await lineClient.pushMessage(userId, {
      type: 'text',
      text: message
    });
    
    console.log('Successfully sent LINE message to:', userId);
    return true;
  } catch (error) {
    console.error('Error sending LINE message:', error);
    throw error;
  }
}