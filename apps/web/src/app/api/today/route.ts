import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/server-state';

export async function GET() {
  const data = serverStore.getTodayDashboard();
  return NextResponse.json(data);
}
