import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/server-state';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const response = await serverStore.chat(messages);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in mentor chat:', error);
    return NextResponse.json({ error: error.message || 'Mentor communication error' }, { status: 500 });
  }
}
