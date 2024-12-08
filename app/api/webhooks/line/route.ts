import { NextRequest, NextResponse } from 'next/server';
import { handleLineWebhook } from '@/lib/lineClient';
import { LINE_CHANNEL_ID } from '@/lib/config/lineConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Verify the channel ID if provided
    const channelId = request.headers.get('x-line-channel-id');
    if (channelId && channelId !== LINE_CHANNEL_ID) {
      return NextResponse.json(
        { error: 'Invalid channel ID' },
        { status: 403 }
      );
    }

    // Process each event
    for (const event of body.events) {
      await handleLineWebhook(event);
    }
    
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Error processing LINE webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}