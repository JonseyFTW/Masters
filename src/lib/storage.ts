import { Entry, Golfer } from './types';

// In-memory fallback for development (when Redis is not available)
let memoryStore: Record<string, string> = {};

function getRedis() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Dynamic import to avoid errors when not configured
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis');
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
}

async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    return redis.get(key);
  }
  const val = memoryStore[key];
  return val ? JSON.parse(val) : null;
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, JSON.stringify(value));
  } else {
    memoryStore[key] = JSON.stringify(value);
  }
}

const KEYS = {
  entries: 'masters:entries',
  golfers: 'masters:golfers',
  config: 'masters:config',
};

// Entries
export async function getEntries(): Promise<Entry[]> {
  return (await kvGet<Entry[]>(KEYS.entries)) || [];
}

export async function setEntries(entries: Entry[]): Promise<void> {
  await kvSet(KEYS.entries, entries);
}

export async function addEntry(entry: Entry): Promise<void> {
  const entries = await getEntries();
  entries.push(entry);
  await setEntries(entries);
}

export async function updateEntry(id: string, updated: Partial<Entry>): Promise<Entry | null> {
  const entries = await getEntries();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...updated };
  await setEntries(entries);
  return entries[idx];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const entries = await getEntries();
  const filtered = entries.filter(e => e.id !== id);
  if (filtered.length === entries.length) return false;
  await setEntries(filtered);
  return true;
}

// Golfers
export async function getGolfers(): Promise<Golfer[]> {
  return (await kvGet<Golfer[]>(KEYS.golfers)) || [];
}

export async function setGolfers(golfers: Golfer[]): Promise<void> {
  await kvSet(KEYS.golfers, golfers);
}

// Seed data for development
export async function seedDevData(): Promise<void> {
  const redis = getRedis();
  if (redis) return; // Don't seed if using real Redis

  const entries = await getEntries();
  if (entries.length > 0) return; // Already seeded

  const { defaultGolfers, sampleEntries } = await import('../data/seed');
  await setGolfers(defaultGolfers);
  await setEntries(sampleEntries);
}

// Initialize on first load
let initialized = false;
export async function initStorage(): Promise<void> {
  if (initialized) return;
  initialized = true;
  await seedDevData();
}

// Reset the in-memory store (for development)
export function resetMemoryStore(): void {
  memoryStore = {};
  initialized = false;
}
