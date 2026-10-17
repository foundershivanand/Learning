import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-state';
import { SubmitAttemptRequest } from '@personal-mentor/shared';

export async function POST(request: Request) {
  try {
    const body: SubmitAttemptRequest = await request.json();
    const result = await serverStore.submitAttempt(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error submitting attempt:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit attempt' }, { status: 500 });
  }
}
