import { NextRequest, NextResponse } from 'next/server';
import { handleLineWebhook } from '@/lib/lineClient';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const events = body.events;
  
  for (const event of events) {
    await handleLineWebhook(event);
  }
  
  return NextResponse.json({ message: 'Received' }, { status: 200 });
}