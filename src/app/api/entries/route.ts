import { NextRequest, NextResponse } from 'next/server';
import { getEntries, addEntry, initStorage } from '@/lib/storage';
import { Entry } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin';
  return auth === `Bearer ${password}`;
}

export async function GET() {
  await initStorage();
  const entries = await getEntries();
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initStorage();
  const body = await request.json();

  const entry: Entry = {
    id: uuidv4(),
    userName: body.userName,
    entryName: body.entryName || `${body.userName} - Entry 1`,
    picks: body.picks,
    alternates: body.alternates,
    paid: body.paid ?? false,
  };

  await addEntry(entry);
  return NextResponse.json({ entry }, { status: 201 });
}
