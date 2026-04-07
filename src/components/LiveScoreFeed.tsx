'use client';

import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { GolferScore } from '@/lib/types';
import { formatScore, getScoreColor } from '@/lib/scoring';

interface LiveScoreFeedProps {
  scores: GolferScore[];
}

export default function LiveScoreFeed({ scores }: LiveScoreFeedProps) {
  // Show top 10 golfers by position (best scores first)
  const topGolfers = scores
    .filter(s => s.status === 'active')
    .slice(0, 10);

  return (
    <div className="bg-masters-card rounded-xl border border-masters-border">
      <div className="flex items-center justify-between p-4 border-b border-masters-border">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-masters-accent-3" />
          <span className="font-semibold text-sm">Tournament Leaders</span>
        </div>
        <Link
          href="/golfers"
          className="text-masters-green-light text-sm flex items-center gap-1 hover:text-masters-yellow transition-colors"
        >
          All Golfers <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-masters-border">
        {topGolfers.length === 0 ? (
          <div className="p-6 text-center text-masters-text text-sm">
            Scores will appear once the tournament begins
          </div>
        ) : (
          topGolfers.map((golfer, i) => (
            <div
              key={golfer.espnId || i}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <span className="text-masters-text text-xs w-6 text-right tabular-nums">
                {golfer.position}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{golfer.name}</div>
                <div className="text-masters-text text-xs">
                  Thru {golfer.thru}
                  {golfer.rounds.length > 0 && (
                    <span className="ml-2">
                      ({golfer.rounds.join(', ')})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {golfer.score < 0 ? (
                  <TrendingDown className="w-3 h-3 text-masters-yellow" />
                ) : golfer.score > 0 ? (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                ) : null}
                <span className={`text-sm font-bold tabular-nums ${getScoreColor(golfer.score)}`}>
                  {formatScore(golfer.score)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
