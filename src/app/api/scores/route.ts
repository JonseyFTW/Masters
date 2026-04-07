import { NextResponse } from 'next/server';
import { fetchESPNScores } from '@/lib/espn';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { scores, tournament } = await fetchESPNScores();
    return NextResponse.json({ scores, tournament });
  } catch (error) {
    console.error('Failed to fetch ESPN scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', scores: [], tournament: null },
      { status: 500 }
    );
  }
}
