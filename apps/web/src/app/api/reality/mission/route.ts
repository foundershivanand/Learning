import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-state';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const skillId = body?.skillId || 'communication';
    const mission = serverStore.getRealityMission(skillId);
    return NextResponse.json(mission);
  } catch (error: any) {
    console.error('Error generating reality mission:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate reality mission' }, { status: 500 });
  }
}
