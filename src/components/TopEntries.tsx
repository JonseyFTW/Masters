'use client';

import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';
import ScoreIndicator from './ScoreIndicator';
import { getPayoutStructure, getPrizePool } from '@/lib/scoring';

interface TopEntriesProps {
  leaderboard: LeaderboardEntry[];
  totalEntries: number;
}

export default function TopEntries({ leaderboard, totalEntries }: TopEntriesProps) {
  const top7 = leaderboard.slice(0, 7);
  const payouts = getPayoutStructure(totalEntries);
  const prizePool = getPrizePool(totalEntries);

  const rankColors: Record<number, string> = {
    1: 'bg-masters-yellow text-masters-dark',
    2: 'bg-masters-text/40 text-white',
    3: 'bg-amber-700/60 text-white',
  };

  return (
    <div className="bg-masters-card rounded-xl border border-masters-border">
      <div className="flex items-center justify-between p-4 border-b border-masters-border">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-masters-yellow" />
          <span className="font-semibold text-sm">Top Entries</span>
        </div>
        <Link
          href="/leaderboard"
          className="text-masters-green-light text-sm flex items-center gap-1 hover:text-masters-yellow transition-colors"
        >
          Full Leaderboard <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-masters-border">
        {top7.length === 0 ? (
          <div className="p-6 text-center text-masters-text text-sm">
            No entries yet
          </div>
        ) : (
          top7.map(item => {
            const payout = payouts.find(p => p.place === item.rank);
            const payoutAmount = payout
              ? Math.round(prizePool * (payout.pct / 100))
              : 0;

            return (
              <Link
                key={item.entry.id}
                href={`/entry/${item.entry.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-masters-card-hover transition-colors"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    rankColors[item.rank] || 'bg-masters-border text-masters-text'
                  }`}
                >
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {item.entry.entryName}
                  </div>
                  <div className="text-masters-text text-xs">
                    {item.madeTheCut}/{item.golferScores.length} made cut
                    {!item.eligible && (
                      <span className="text-red-400 ml-1">Ineligible</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <ScoreIndicator score={item.totalScore} size="sm" />
                  {payoutAmount > 0 && (
                    <div className="text-masters-accent-3 text-xs font-semibold">
                      ${payoutAmount}
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
