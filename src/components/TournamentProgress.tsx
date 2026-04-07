'use client';

import { Clock } from 'lucide-react';
import { TournamentState } from '@/lib/types';

interface TournamentProgressProps {
  tournament: TournamentState | null;
}

const rounds = ['Round 1', 'Round 2', 'Cut', 'Round 3', 'Round 4'];

export default function TournamentProgress({ tournament }: TournamentProgressProps) {
  const currentRound = tournament?.currentRound || 0;
  const status = tournament?.status || 'pre';

  const progress = status === 'post' ? 100
    : status === 'pre' ? 0
    : (currentRound / 4) * 100;

  const statusLabel = status === 'post'
    ? 'Tournament Complete'
    : status === 'pre'
      ? 'Tournament Starts Thursday'
      : `Round ${currentRound} in Progress`;

  return (
    <div className="bg-masters-card rounded-xl p-4 border border-masters-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-masters-text" />
          <span className="font-semibold text-sm">{statusLabel}</span>
        </div>
        {status === 'in' && (
          <span className="text-masters-text text-sm">
            {currentRound} / 4 rounds
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-masters-border rounded-full overflow-hidden">
          <div
            className="h-full bg-masters-yellow rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Round labels */}
        <div className="flex justify-between mt-2">
          {rounds.map((label, i) => {
            const roundNum = i < 2 ? i + 1 : i; // Cut is between R2 and R3
            const isActive = status === 'in' && (
              (label === 'Cut' && currentRound >= 3) ||
              (label !== 'Cut' && roundNum <= currentRound)
            );
            const isCurrent = status === 'in' && (
              (label === 'Cut' && currentRound === 3) ||
              (label !== 'Cut' && roundNum === currentRound)
            );

            return (
              <span
                key={label}
                className={`text-[10px] ${
                  isCurrent
                    ? 'text-masters-yellow font-semibold'
                    : isActive || status === 'post'
                      ? 'text-white'
                      : 'text-masters-text'
                }`}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
