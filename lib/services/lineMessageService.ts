import { Client } from '@line/bot-sdk';
import type { TextMessage } from '@line/bot-sdk';
import { lineConfig } from '../config/lineConfig';

export class LineMessageService {
  private client: Client;

  constructor() {
    this.client = new Client(lineConfig);
  }

  async sendMessage(userId: string, text: string): Promise<boolean> {
    try {
      const message: TextMessage = {
        type: 'text',
        text: text
      };

      await this.client.pushMessage(userId, message);
      return true;
    } catch (error) {
      console.error('Error sending LINE message:', error);
      return false;
    }
  }

  async replyMessage(replyToken: string, text: string): Promise<boolean> {
    try {
      const message: TextMessage = {
        type: 'text',
        text: text
      };

      await this.client.replyMessage(replyToken, message);
      return true;
    } catch (error) {
      console.error('Error replying to LINE message:', error);
      return false;
    }
  }
}

export const lineMessageService = new LineMessageService();