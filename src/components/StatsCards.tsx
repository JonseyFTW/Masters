'use client';

import { DollarSign, Users, Clock, Trophy } from 'lucide-react';
import { LeaderboardEntry, TournamentState } from '@/lib/types';
import { formatScore, getPrizePool } from '@/lib/scoring';

interface StatsCardsProps {
  entries: number;
  tournament: TournamentState | null;
  leader: LeaderboardEntry | null;
}

export default function StatsCards({ entries, tournament, leader }: StatsCardsProps) {
  const prizePool = getPrizePool(entries);

  const roundLabel = tournament?.status === 'pre'
    ? 'Pre-Tournament'
    : tournament?.status === 'post'
      ? 'Final'
      : `Round ${tournament?.currentRound || 1}`;

  const cards = [
    {
      label: 'Prize Pool',
      value: `$${prizePool.toLocaleString()}`,
      icon: DollarSign,
      accent: 'border-masters-accent-1',
      iconBg: 'bg-masters-accent-1/20',
      iconColor: 'text-masters-accent-1',
    },
    {
      label: 'Total Entries',
      value: `${entries}`,
      icon: Users,
      accent: 'border-masters-accent-2',
      iconBg: 'bg-masters-accent-2/20',
      iconColor: 'text-masters-accent-2',
    },
    {
      label: 'Current Round',
      value: roundLabel,
      icon: Clock,
      accent: 'border-masters-accent-4',
      iconBg: 'bg-masters-accent-4/20',
      iconColor: 'text-masters-accent-4',
    },
    {
      label: 'Leader',
      value: leader
        ? `${leader.entry.userName.split(' ')[0]} (${formatScore(leader.totalScore)})`
        : '—',
      icon: Trophy,
      accent: 'border-masters-accent-3',
      iconBg: 'bg-masters-accent-3/20',
      iconColor: 'text-masters-accent-3',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          className={`bg-masters-card rounded-xl p-4 border-l-4 ${card.accent} border-t border-r border-b border-masters-border`}
        >
          <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
            <card.icon className={`w-4 h-4 ${card.iconColor}`} />
          </div>
          <div className="text-2xl font-bold truncate">{card.value}</div>
          <div className="text-masters-text text-sm">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
