import { NextRequest, NextResponse } from 'next/server';
import { getEntries, setEntries, initStorage } from '@/lib/storage';
import { Entry } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin';
  return auth === `Bearer ${password}`;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initStorage();

  const { csv, replaceAll } = await request.json();

  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'CSV data required' }, { status: 400 });
  }

  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV must have header + at least 1 row' }, { status: 400 });
  }

  // Skip header row
  const newEntries: Entry[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);

    if (cols.length < 13) {
      errors.push(`Row ${i}: Expected 13 columns, got ${cols.length}`);
      continue;
    }

    const [
      name,
      t1p1, t1p2,
      t2p1, t2p2, t2p3,
      t3p1, t3p2, t3p3, t3p4,
      alt1, alt2, alt3,
    ] = cols;

    // Check for existing entries by this user to auto-number
    const existingCount = newEntries.filter(
      e => e.userName === name
    ).length;

    newEntries.push({
      id: uuidv4(),
      userName: name,
      entryName: `${name} - Entry ${existingCount + 1}`,
      picks: {
        tier1: [t1p1, t1p2],
        tier2: [t2p1, t2p2, t2p3],
        tier3: [t3p1, t3p2, t3p3, t3p4],
      },
      alternates: {
        tier1: alt1,
        tier2: alt2,
        tier3: alt3,
      },
      paid: cols[13]?.toLowerCase() === 'true' || cols[13] === '1' || false,
    });
  }

  if (replaceAll) {
    await setEntries(newEntries);
  } else {
    const existing = await getEntries();
    await setEntries([...existing, ...newEntries]);
  }

  return NextResponse.json({
    imported: newEntries.length,
    errors,
    total: replaceAll ? newEntries.length : (await getEntries()).length,
  });
}
