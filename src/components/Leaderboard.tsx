'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { LeaderboardEntry, GolferScore, Golfer } from '@/lib/types';
import { formatScore, getScoreColor, getPayoutStructure, getPrizePool } from '@/lib/scoring';
import TierBadge from './TierBadge';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  totalEntries: number;
  golfers?: Golfer[];
}

function GolferTier(golferName: string, golferList: Golfer[]): 1 | 2 | 3 {
  const g = golferList.find(
    gl => gl.name.toLowerCase() === golferName.toLowerCase()
  );
  return g?.tier || 3;
}

function GolferRow({ golfer, isBestFive, tier }: { golfer: GolferScore; isBestFive: boolean; tier: 1 | 2 | 3 }) {
  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm ${
        isBestFive ? 'bg-masters-green/10' : 'opacity-60'
      } ${golfer.status === 'cut' ? 'line-through opacity-40' : ''}`}
    >
      <TierBadge tier={tier} />
      <span className="flex-1 truncate">{golfer.name}</span>
      <span className="text-masters-text text-xs w-10 text-center">{golfer.thru}</span>
      <span className={`w-10 text-right font-bold tabular-nums ${getScoreColor(golfer.score)}`}>
        {formatScore(golfer.score)}
      </span>
    </div>
  );
}

function EntryRow({
  item,
  payoutAmount,
  golfers,
}: {
  item: LeaderboardEntry;
  payoutAmount: number;
  golfers: Golfer[];
}) {
  const [expanded, setExpanded] = useState(false);

  const rankColors: Record<number, string> = {
    1: 'bg-masters-yellow text-masters-dark',
    2: 'bg-masters-text/40 text-white',
    3: 'bg-amber-700/60 text-white',
  };

  const bestFiveNames = new Set(item.bestFive.map(g => g.name));

  return (
    <div className={`border-b border-masters-border ${payoutAmount > 0 ? 'border-l-2 border-l-masters-yellow' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-masters-card-hover transition-colors text-left"
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            rankColors[item.rank] || 'bg-masters-border text-masters-text'
          }`}
        >
          {item.tied ? `T${item.rank}` : item.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{item.entry.entryName}</div>
          <div className="text-masters-text text-xs flex items-center gap-2">
            <span>{item.madeTheCut} made cut</span>
            {!item.eligible && <span className="text-red-400">Ineligible</span>}
            {!item.entry.paid && <span className="text-masters-yellow">Unpaid</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-3">
          <div>
            <div className={`font-bold tabular-nums ${getScoreColor(item.totalScore)}`}>
              {formatScore(item.totalScore)}
            </div>
            {payoutAmount > 0 && (
              <div className="text-masters-accent-3 text-xs font-semibold">${payoutAmount}</div>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-masters-text" />
          ) : (
            <ChevronDown className="w-4 h-4 text-masters-text" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          <div className="text-xs text-masters-text mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded bg-masters-green" /> = Best 5
          </div>
          {item.golferScores.map((golfer, i) => (
            <GolferRow
              key={`${golfer.name}-${i}`}
              golfer={golfer}
              isBestFive={bestFiveNames.has(golfer.name)}
              tier={GolferTier(golfer.name, golfers)}
            />
          ))}
          <div className="pt-2 mt-2 border-t border-masters-border">
            <Link
              href={`/entry/${item.entry.id}`}
              className="text-masters-green-light text-xs hover:text-masters-yellow transition-colors"
            >
              View full details &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Leaderboard({ leaderboard, totalEntries, golfers = [] }: LeaderboardProps) {
  const [search, setSearch] = useState('');
  const payouts = getPayoutStructure(totalEntries);
  const prizePool = getPrizePool(totalEntries);

  const filtered = search
    ? leaderboard.filter(item =>
        item.entry.entryName.toLowerCase().includes(search.toLowerCase()) ||
        item.entry.userName.toLowerCase().includes(search.toLowerCase())
      )
    : leaderboard;

  return (
    <div className="bg-masters-card rounded-xl border border-masters-border">
      {/* Search */}
      <div className="p-4 border-b border-masters-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-masters-text" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-masters-dark border border-masters-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-masters-text focus:outline-none focus:border-masters-green"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 text-masters-text text-xs font-medium border-b border-masters-border">
        <span className="w-7">Rank</span>
        <span className="flex-1">Entry</span>
        <span className="w-16 text-right">Score</span>
        <span className="w-4" />
      </div>

      {/* Entries */}
      <div className="divide-y divide-masters-border">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-masters-text text-sm">
            {search ? 'No matching entries' : 'No entries yet'}
          </div>
        ) : (
          filtered.map(item => {
            const payout = payouts.find(p => p.place === item.rank);
            const payoutAmount = payout ? Math.round(prizePool * (payout.pct / 100)) : 0;
            return (
              <EntryRow
                key={item.entry.id}
                item={item}
                payoutAmount={payoutAmount}
                golfers={golfers}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
