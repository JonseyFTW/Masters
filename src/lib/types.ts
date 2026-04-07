export interface Golfer {
  name: string;
  tier: 1 | 2 | 3;
}

export interface Entry {
  id: string;
  userName: string;
  entryName: string;
  picks: {
    tier1: [string, string];
    tier2: [string, string, string];
    tier3: [string, string, string, string];
  };
  alternates: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  paid: boolean;
}

export interface GolferScore {
  name: string;
  espnId: string;
  score: number;
  scoreDisplay: string;
  totalStrokes: number;
  rounds: number[];
  position: string;
  status: 'active' | 'cut' | 'withdrawn';
  thru: string;
  currentRound: number;
}

export interface LeaderboardEntry {
  entry: Entry;
  golferScores: GolferScore[];
  bestFive: GolferScore[];
  totalScore: number;
  madeTheCut: number;
  eligible: boolean;
  rank: number;
  tied: boolean;
}

export interface TournamentState {
  name: string;
  status: 'pre' | 'in' | 'post';
  currentRound: number;
  cutLine: number | null;
  lastUpdated: string;
}

export interface PayoutTier {
  place: number;
  pct: number;
}
