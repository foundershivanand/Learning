import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-state';

export async function GET() {
  try {
    const challenge = await serverStore.getNextChallenge();
    return NextResponse.json(challenge);
  } catch (error: any) {
    console.error('Error generating next challenge:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate challenge' }, { status: 500 });
  }
}
