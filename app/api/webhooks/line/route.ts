import { NextResponse } from 'next/server';
import { handleLineMessage } from '@/lib/handlers/lineMessageHandler';

import type { LineMessageEvent } from '@/app/types/line';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events = body.events as LineMessageEvent[];
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        await handleLineMessage(event);
      }
    }
    
    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Error processing LINE webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}