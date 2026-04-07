import { Entry, GolferScore, LeaderboardEntry, PayoutTier } from './types';
import { findGolferScore } from './espn';

export function getPayoutStructure(totalEntries: number): PayoutTier[] {
  if (totalEntries <= 10) return [{ place: 1, pct: 100 }];
  if (totalEntries <= 20) return [{ place: 1, pct: 70 }, { place: 2, pct: 30 }];
  if (totalEntries <= 40) return [{ place: 1, pct: 70 }, { place: 2, pct: 20 }, { place: 3, pct: 10 }];
  return [{ place: 1, pct: 70 }, { place: 2, pct: 15 }, { place: 3, pct: 10 }, { place: 4, pct: 5 }];
}

export function getPrizePool(totalEntries: number, entryFee: number = 20): number {
  return totalEntries * entryFee;
}

function getAllPickNames(entry: Entry): string[] {
  return [
    ...entry.picks.tier1,
    ...entry.picks.tier2,
    ...entry.picks.tier3,
  ];
}

function getGolferScoresForEntry(
  entry: Entry,
  allScores: GolferScore[],
  tournamentStarted: boolean
): GolferScore[] {
  const pickNames = getAllPickNames(entry);

  return pickNames.map(name => {
    const score = findGolferScore(allScores, name);

    // Handle alternate replacement: if golfer WD before tournament starts
    if (score && score.status === 'withdrawn' && !tournamentStarted) {
      const tier = getTierForPick(entry, name);
      if (tier) {
        const altName = entry.alternates[`tier${tier}` as keyof typeof entry.alternates];
        const altScore = findGolferScore(allScores, altName);
        if (altScore) return altScore;
      }
    }

    return score || createPlaceholderScore(name);
  });
}

function getTierForPick(entry: Entry, name: string): 1 | 2 | 3 | null {
  const normalized = name.toLowerCase();
  if (entry.picks.tier1.some(p => p.toLowerCase() === normalized)) return 1;
  if (entry.picks.tier2.some(p => p.toLowerCase() === normalized)) return 2;
  if (entry.picks.tier3.some(p => p.toLowerCase() === normalized)) return 3;
  return null;
}

function createPlaceholderScore(name: string): GolferScore {
  return {
    name,
    espnId: '',
    score: 0,
    scoreDisplay: 'E',
    totalStrokes: 0,
    rounds: [],
    position: '-',
    status: 'active',
    thru: '-',
    currentRound: 0,
  };
}

function selectBestFive(golferScores: GolferScore[]): GolferScore[] {
  return [...golferScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}

function compareTiebreaker(a: LeaderboardEntry, b: LeaderboardEntry): number {
  // Compare individual scores of best 5 (ascending)
  const aScores = a.bestFive.map(g => g.score).sort((x, y) => x - y);
  const bScores = b.bestFive.map(g => g.score).sort((x, y) => x - y);

  for (let i = 0; i < Math.min(aScores.length, bScores.length); i++) {
    if (aScores[i] !== bScores[i]) return aScores[i] - bScores[i];
  }

  // If still tied, compare remaining golfers (6th, 7th, etc.)
  const aRemaining = a.golferScores
    .filter(g => !a.bestFive.includes(g))
    .map(g => g.score)
    .sort((x, y) => x - y);
  const bRemaining = b.golferScores
    .filter(g => !b.bestFive.includes(g))
    .map(g => g.score)
    .sort((x, y) => x - y);

  for (let i = 0; i < Math.min(aRemaining.length, bRemaining.length); i++) {
    if (aRemaining[i] !== bRemaining[i]) return aRemaining[i] - bRemaining[i];
  }

  return 0;
}

export function calculateLeaderboard(
  entries: Entry[],
  allScores: GolferScore[],
  tournamentStarted: boolean
): LeaderboardEntry[] {
  const leaderboard: LeaderboardEntry[] = entries.map(entry => {
    const golferScores = getGolferScoresForEntry(entry, allScores, tournamentStarted);
    const bestFive = selectBestFive(golferScores);
    const totalScore = bestFive.reduce((sum, g) => sum + g.score, 0);
    const madeTheCut = golferScores.filter(g => g.status !== 'cut').length;

    return {
      entry,
      golferScores,
      bestFive,
      totalScore,
      madeTheCut,
      eligible: madeTheCut >= 5,
      rank: 0,
      tied: false,
    };
  });

  // Sort: eligible first, then by totalScore ascending
  leaderboard.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
    return compareTiebreaker(a, b);
  });

  // Assign ranks
  for (let i = 0; i < leaderboard.length; i++) {
    if (i === 0) {
      leaderboard[i].rank = 1;
    } else {
      const prev = leaderboard[i - 1];
      if (
        leaderboard[i].totalScore === prev.totalScore &&
        leaderboard[i].eligible === prev.eligible &&
        compareTiebreaker(leaderboard[i], prev) === 0
      ) {
        leaderboard[i].rank = prev.rank;
        leaderboard[i].tied = true;
        prev.tied = true;
      } else {
        leaderboard[i].rank = i + 1;
      }
    }
  }

  return leaderboard;
}

export function formatScore(score: number): string {
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : `${score}`;
}

export function getScoreColor(score: number): string {
  if (score < 0) return 'text-masters-yellow';
  if (score > 0) return 'text-red-400';
  return 'text-white';
}
