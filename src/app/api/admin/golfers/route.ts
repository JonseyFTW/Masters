import { NextRequest, NextResponse } from 'next/server';
import { getGolfers, setGolfers, initStorage } from '@/lib/storage';

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin';
  return auth === `Bearer ${password}`;
}

export async function GET() {
  await initStorage();
  const golfers = await getGolfers();
  return NextResponse.json({ golfers });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initStorage();
  const { golfers } = await request.json();
  await setGolfers(golfers);
  return NextResponse.json({ success: true, count: golfers.length });
}
