import { NextRequest, NextResponse } from 'next/server';
import { handleFacebookWebhook } from '@/lib/facebookClient';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  await handleFacebookWebhook(body);
  
  return NextResponse.json({ message: 'Received' }, { status: 200 });
}