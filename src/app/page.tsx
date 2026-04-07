'use client';

import { useLeaderboard } from '@/lib/hooks';
import StatsCards from '@/components/StatsCards';
import TournamentProgress from '@/components/TournamentProgress';
import TopEntries from '@/components/TopEntries';
import LiveScoreFeed from '@/components/LiveScoreFeed';

export default function DashboardPage() {
  const { leaderboard, scores, tournament, entries, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-masters-card rounded-xl h-28 animate-pulse border border-masters-border" />
          ))}
        </div>
        <div className="bg-masters-card rounded-xl h-20 animate-pulse border border-masters-border" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-masters-card rounded-xl h-80 animate-pulse border border-masters-border" />
          <div className="bg-masters-card rounded-xl h-80 animate-pulse border border-masters-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards
        entries={entries.length}
        tournament={tournament}
        leader={leaderboard[0] || null}
      />

      <TournamentProgress tournament={tournament} />

      <div className="grid lg:grid-cols-2 gap-6">
        <LiveScoreFeed scores={scores} />
        <TopEntries leaderboard={leaderboard} totalEntries={entries.length} />
      </div>

      {tournament?.lastUpdated && (
        <div className="text-center text-masters-text text-xs">
          Last updated: {new Date(tournament.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
