import { NextResponse } from 'next/server';
import { fetchESPNScores } from '@/lib/espn';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { scores } = await fetchESPNScores();
    const field = scores.map(s => ({
      name: s.name,
      espnId: s.espnId,
    }));
    return NextResponse.json({ field });
  } catch (error) {
    console.error('Failed to fetch ESPN field:', error);
    return NextResponse.json({ error: 'Failed to fetch field', field: [] }, { status: 500 });
  }
}
