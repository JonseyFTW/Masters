'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, AlertCircle } from 'lucide-react';
import { useLeaderboard } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { Golfer } from '@/lib/types';
import { formatScore, getScoreColor, getPayoutStructure, getPrizePool } from '@/lib/scoring';
import TierBadge from '@/components/TierBadge';
import ScoreIndicator from '@/components/ScoreIndicator';

export default function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
        <div className="bg-masters-card rounded-xl h-64 animate-pulse border border-masters-border" />
      </div>
    );
  }

  const item = leaderboard.find(l => l.entry.id === id);

  if (!item) {
    return (
      <div className="space-y-4">
        <Link href="/leaderboard" className="text-masters-green-light flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
        </Link>
        <div className="bg-masters-card rounded-xl p-8 text-center border border-masters-border">
          <AlertCircle className="w-8 h-8 text-masters-text mx-auto mb-2" />
          <p className="text-masters-text">Entry not found</p>
        </div>
      </div>
    );
  }

  const payouts = getPayoutStructure(entries.length);
  const prizePool = getPrizePool(entries.length);
  const payout = payouts.find(p => p.place === item.rank);
  const payoutAmount = payout ? Math.round(prizePool * (payout.pct / 100)) : 0;

  const bestFiveNames = new Set(item.bestFive.map(g => g.name));

  function getTier(golferName: string): 1 | 2 | 3 {
    const g = golfers.find(gl => gl.name.toLowerCase() === golferName.toLowerCase());
    return g?.tier || 3;
  }

  const tiers: { label: string; picks: string[]; tier: 1 | 2 | 3 }[] = [
    { label: 'Tier 1', picks: [...item.entry.picks.tier1], tier: 1 },
    { label: 'Tier 2', picks: [...item.entry.picks.tier2], tier: 2 },
    { label: 'Tier 3', picks: [...item.entry.picks.tier3], tier: 3 },
  ];

  return (
    <div className="space-y-4">
      <Link href="/leaderboard" className="text-masters-green-light flex items-center gap-1 text-sm hover:text-masters-yellow transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
      </Link>

      {/* Header Card */}
      <div className="bg-masters-card rounded-xl border border-masters-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{item.entry.entryName}</h1>
            <p className="text-masters-text text-sm">{item.entry.userName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-masters-text text-sm">Rank</span>
              <span className="text-2xl font-bold">
                {item.tied ? `T${item.rank}` : `#${item.rank}`}
              </span>
            </div>
            <ScoreIndicator score={item.totalScore} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-masters-border">
          <div>
            <div className="text-masters-text text-xs">Made Cut</div>
            <div className="font-bold">{item.madeTheCut} / {item.golferScores.length}</div>
          </div>
          <div>
            <div className="text-masters-text text-xs">Eligible</div>
            <div className={`font-bold ${item.eligible ? 'text-masters-accent-3' : 'text-red-400'}`}>
              {item.eligible ? 'Yes' : 'No'}
            </div>
          </div>
          <div>
            <div className="text-masters-text text-xs">Payout</div>
            <div className={`font-bold ${payoutAmount > 0 ? 'text-masters-accent-3' : 'text-masters-text'}`}>
              {payoutAmount > 0 ? `$${payoutAmount}` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Picks by Tier */}
      {tiers.map(({ label, picks, tier }) => (
        <div key={tier} className="bg-masters-card rounded-xl border border-masters-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-masters-border">
            <TierBadge tier={tier} />
            <span className="font-semibold text-sm">{label} Picks</span>
          </div>
          <div className="divide-y divide-masters-border">
            {picks.map(name => {
              const golferScore = item.golferScores.find(
                g => g.name.toLowerCase() === name.toLowerCase()
              );
              const isBest = bestFiveNames.has(golferScore?.name || name);
              return (
                <div
                  key={name}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isBest ? 'bg-masters-green/5' : ''
                  } ${golferScore?.status === 'cut' ? 'opacity-40' : ''}`}
                >
                  {isBest && <Trophy className="w-3 h-3 text-masters-yellow flex-shrink-0" />}
                  {!isBest && <div className="w-3" />}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${golferScore?.status === 'cut' ? 'line-through' : ''}`}>
                      {golferScore?.name || name}
                    </div>
                    <div className="text-masters-text text-xs">
                      {golferScore?.status === 'cut' && 'Missed Cut'}
                      {golferScore?.status === 'withdrawn' && 'Withdrawn'}
                      {golferScore?.status === 'active' && `Pos: ${golferScore.position} | Thru: ${golferScore.thru}`}
                      {!golferScore && 'No score data'}
                    </div>
                  </div>
                  <div className="text-right">
                    {golferScore && (
                      <>
                        <div className={`font-bold tabular-nums ${getScoreColor(golferScore.score)}`}>
                          {formatScore(golferScore.score)}
                        </div>
                        {golferScore.rounds.length > 0 && (
                          <div className="text-masters-text text-xs tabular-nums">
                            {golferScore.rounds.join(' / ')}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Alternate */}
          <div className="px-4 py-2 bg-masters-dark/30 text-xs text-masters-text border-t border-masters-border">
            Alt: {item.entry.alternates[`tier${tier}` as keyof typeof item.entry.alternates]}
          </div>
        </div>
      ))}
    </div>
  );
}
