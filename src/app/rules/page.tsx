'use client';

import { useEntries } from '@/lib/hooks';
import { getPayoutStructure, getPrizePool } from '@/lib/scoring';
import { DollarSign, Users, Trophy, AlertCircle, ArrowDown, Repeat } from 'lucide-react';

export default function RulesPage() {
  const { entries } = useEntries();
  const totalEntries = entries.length;
  const prizePool = getPrizePool(totalEntries);
  const payouts = getPayoutStructure(totalEntries);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Competition Rules</h1>

      {/* Entry Fee */}
      <div className="bg-masters-card rounded-xl border border-masters-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-masters-yellow" />
          <h2 className="font-semibold text-lg">Entry</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>Entry fee: <span className="text-white font-semibold">$20</span></li>
          <li>Multiple entries allowed per person</li>
        </ul>
      </div>

      {/* Format */}
      <div className="bg-masters-card rounded-xl border border-masters-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-masters-accent-4" />
          <h2 className="font-semibold text-lg">Format</h2>
        </div>
        <p className="text-sm text-gray-300 mb-3">Pick 9 golfers total:</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-masters-dark rounded-lg p-3 text-center border border-masters-border">
            <div className="text-masters-yellow font-bold text-lg">2</div>
            <div className="text-xs text-masters-text">from Tier 1</div>
          </div>
          <div className="bg-masters-dark rounded-lg p-3 text-center border border-masters-border">
            <div className="text-masters-accent-4 font-bold text-lg">3</div>
            <div className="text-xs text-masters-text">from Tier 2</div>
          </div>
          <div className="bg-masters-dark rounded-lg p-3 text-center border border-masters-border">
            <div className="text-masters-text font-bold text-lg">4</div>
            <div className="text-xs text-masters-text">from Tier 3</div>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>At least <span className="text-white font-semibold">5 of your 9 golfers</span> must make the cut to be eligible for payout</li>
          <li>Select <span className="text-white font-semibold">1 alternate</span> for each tier</li>
          <li>Alternates replace a golfer who withdraws before the first tee time Thursday morning</li>
          <li>Alternates must be different from your original selections</li>
        </ul>
      </div>

      {/* Scoring */}
      <div className="bg-masters-card rounded-xl border border-masters-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <ArrowDown className="w-5 h-5 text-masters-accent-3" />
          <h2 className="font-semibold text-lg">Scoring & Tiebreakers</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>Lowest combined score of your <span className="text-white font-semibold">best 5 golfers</span> wins</li>
          <li>Ties broken by comparing individual golfer scores (lowest first)</li>
          <li>If still tied, compare remaining golfers outside your top 5</li>
        </ul>
      </div>

      {/* Alternates */}
      <div className="bg-masters-card rounded-xl border border-masters-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Repeat className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-lg">Alternates</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>Alternates <span className="text-white font-semibold">only</span> replace a golfer who withdraws before the first tee time Thursday morning</li>
          <li>Alternates must be different from your original selections</li>
          <li>One alternate per tier</li>
        </ul>
      </div>

      {/* Payouts */}
      <div className="bg-masters-card rounded-xl border border-masters-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-masters-yellow" />
          <h2 className="font-semibold text-lg">Payouts</h2>
        </div>

        <div className="bg-masters-dark rounded-lg p-4 mb-4 border border-masters-border">
          <div className="text-sm text-masters-text mb-1">Current Pool</div>
          <div className="text-2xl font-bold text-masters-accent-3">${prizePool.toLocaleString()}</div>
          <div className="text-xs text-masters-text">{totalEntries} entries &times; $20</div>
        </div>

        <div className="space-y-2 mb-4">
          {payouts.map(p => (
            <div key={p.place} className="flex items-center justify-between bg-masters-dark rounded-lg px-4 py-2 border border-masters-border">
              <span className="text-sm font-medium">
                {p.place === 1 ? '1st' : p.place === 2 ? '2nd' : p.place === 3 ? '3rd' : `${p.place}th`}
              </span>
              <div className="text-right">
                <span className="text-masters-accent-3 font-bold">${Math.round(prizePool * (p.pct / 100))}</span>
                <span className="text-masters-text text-xs ml-2">({p.pct}%)</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-masters-text space-y-1">
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>10 or fewer entries: Winner takes all</span>
          </div>
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>11-20: 1st 70%, 2nd 30%</span>
          </div>
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>21-40: 1st 70%, 2nd 20%, 3rd 10%</span>
          </div>
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>40+: 1st 70%, 2nd 15%, 3rd 10%, 4th 5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
