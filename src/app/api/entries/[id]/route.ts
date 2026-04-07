import { NextRequest, NextResponse } from 'next/server';
import { updateEntry, deleteEntry, initStorage } from '@/lib/storage';

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin';
  return auth === `Bearer ${password}`;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initStorage();
  const { id } = await params;
  const body = await request.json();
  const updated = await updateEntry(id, body);

  if (!updated) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  return NextResponse.json({ entry: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initStorage();
  const { id } = await params;
  const deleted = await deleteEntry(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
