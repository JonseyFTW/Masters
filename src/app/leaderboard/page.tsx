'use client';

import { useLeaderboard } from '@/lib/hooks';
import Leaderboard from '@/components/Leaderboard';
import { useEffect, useState } from 'react';
import { Golfer } from '@/lib/types';

export default function LeaderboardPage() {
  const { leaderboard, entries, isLoading } = useLeaderboard();
  const [golfers, setGolfers] = useState<Golfer[]>([]);

  useEffect(() => {
    fetch('/api/admin/golfers')
      .then(res => res.json())
      .then(data => setGolfers(data.golfers || []))
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="bg-masters-card rounded-xl h-96 animate-pulse border border-masters-border" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <span className="text-masters-text text-sm">{entries.length} entries</span>
      </div>
      <Leaderboard leaderboard={leaderboard} totalEntries={entries.length} golfers={golfers} />
    </div>
  );
}
