'use client';

import { useScores, useEntries } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { Golfer, GolferScore } from '@/lib/types';
import { formatScore, getScoreColor } from '@/lib/scoring';
import { findGolferScore, normalizeName } from '@/lib/espn';
import TierBadge from '@/components/TierBadge';
import { Users } from 'lucide-react';

export default function GolfersPage() {
  const { scores, isLoading: scoresLoading } = useScores();
  const { entries } = useEntries();
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [sortBy, setSortBy] = useState<'tier' | 'score'>('tier');

  useEffect(() => {
    fetch('/api/admin/golfers')
      .then(res => res.json())
      .then(data => setGolfers(data.golfers || []))
      .catch(() => {});
  }, []);

  // Count how many entries picked each golfer (uses normalized names to handle typos/accents)
  function pickCount(golferName: string): number {
    const normalizedGolfer = normalizeName(golferName);
    return entries.filter(e => {
      const allPicks = [...e.picks.tier1, ...e.picks.tier2, ...e.picks.tier3];
      return allPicks.some(p => {
        const normalizedPick = normalizeName(p);
        return normalizedPick === normalizedGolfer ||
          normalizedPick.includes(normalizedGolfer) ||
          normalizedGolfer.includes(normalizedPick);
      });
    }).length;
  }

  // Merge golfer tier data with live scores
  const golferData = golfers.map(g => {
    const score = findGolferScore(scores, g.name);
    return { ...g, score, picks: pickCount(g.name) };
  });

  const sorted = [...golferData].sort((a, b) => {
    if (sortBy === 'score') {
      const aScore = a.score?.score ?? 999;
      const bScore = b.score?.score ?? 999;
      return aScore - bScore;
    }
    if (a.tier !== b.tier) return a.tier - b.tier;
    const aScore = a.score?.score ?? 999;
    const bScore = b.score?.score ?? 999;
    return aScore - bScore;
  });

  const tiers = [1, 2, 3] as const;

  if (scoresLoading && golfers.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Golfers</h1>
        <div className="bg-masters-card rounded-xl h-96 animate-pulse border border-masters-border" />
      </div>
    );
  }

  function GolferRow({ golfer, score, picks }: { golfer: Golfer; score: GolferScore | null; picks: number }) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-masters-card-hover transition-colors">
        <span className="text-masters-text text-xs w-8 text-right tabular-nums">
          {score?.position || '-'}
        </span>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${score?.status === 'cut' ? 'line-through opacity-50' : ''}`}>
            {golfer.name}
          </div>
          <div className="text-masters-text text-xs flex items-center gap-2">
            {score?.thru && score.thru !== '-' && <span>Thru {score.thru}</span>}
            {(() => {
              const completedRounds = score?.rounds.filter(r => r >= 60) || [];
              return completedRounds.length > 0 ? (
                <span className="tabular-nums">({completedRounds.join(', ')})</span>
              ) : null;
            })()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {picks > 0 && (
            <span className="flex items-center gap-1 text-masters-text text-xs">
              <Users className="w-3 h-3" />
              {picks}
            </span>
          )}
          <span className={`w-10 text-right font-bold tabular-nums ${score ? getScoreColor(score.score) : 'text-masters-text'}`}>
            {score ? formatScore(score.score) : '-'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Golfers</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('tier')}
            className={`px-3 py-1 rounded-lg text-sm ${sortBy === 'tier' ? 'bg-masters-green text-white' : 'bg-masters-card text-masters-text border border-masters-border'}`}
          >
            By Tier
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1 rounded-lg text-sm ${sortBy === 'score' ? 'bg-masters-green text-white' : 'bg-masters-card text-masters-text border border-masters-border'}`}
          >
            By Score
          </button>
        </div>
      </div>

      {sortBy === 'tier' ? (
        tiers.map(tier => {
          const tierGolfers = sorted.filter(g => g.tier === tier);
          return (
            <div key={tier} className="bg-masters-card rounded-xl border border-masters-border">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-masters-border">
                <TierBadge tier={tier} />
                <span className="font-semibold text-sm">
                  Tier {tier} ({tierGolfers.length} golfers)
                </span>
              </div>
              <div className="divide-y divide-masters-border">
                {tierGolfers.map(g => (
                  <GolferRow key={g.name} golfer={g} score={g.score} picks={g.picks} />
                ))}
                {tierGolfers.length === 0 && (
                  <div className="p-4 text-center text-masters-text text-sm">No golfers assigned</div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-masters-card rounded-xl border border-masters-border">
          <div className="divide-y divide-masters-border">
            {sorted.map(g => (
              <div key={g.name} className="flex items-center gap-2">
                <div className="pl-2"><TierBadge tier={g.tier} /></div>
                <div className="flex-1">
                  <GolferRow golfer={g} score={g.score} picks={g.picks} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
