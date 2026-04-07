import { GolferScore, TournamentState } from './types';

const ESPN_GOLF_URL = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';

interface ESPNResponse {
  events: ESPNEvent[];
}

interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  competitions: ESPNCompetition[];
  status: {
    type: {
      name: string;
      state: string;
      description: string;
    };
  };
}

interface ESPNCompetition {
  id: string;
  competitors: ESPNCompetitor[];
  status: {
    period: number;
    type: {
      name: string;
      state: string;
    };
  };
}

interface ESPNCompetitor {
  id: string;
  athlete: {
    fullName: string;
    displayName: string;
    shortName: string;
    flag?: {
      alt: string;
    };
  };
  score: string;
  linescores?: { value: number; period: number }[];
  status?: {
    period: number;
    type: {
      name: string;
      description: string;
    };
    displayValue?: string;
  };
  sortOrder?: number;
  statistics?: { name: string; value: string }[];
}

// In-memory cache
let cachedScores: { data: GolferScore[]; tournament: TournamentState; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

function parseScore(scoreStr: string): number {
  if (!scoreStr || scoreStr === 'E') return 0;
  const num = parseInt(scoreStr, 10);
  return isNaN(num) ? 0 : num;
}

function parseCompetitorStatus(competitor: ESPNCompetitor): 'active' | 'cut' | 'withdrawn' {
  const statusName = competitor.status?.type?.name || '';
  const statusDesc = competitor.status?.type?.description || '';

  if (statusName.includes('CUT') || statusDesc.toLowerCase().includes('cut')) return 'cut';
  if (statusName.includes('WD') || statusDesc.toLowerCase().includes('withdraw')) return 'withdrawn';
  if (statusName.includes('DQ') || statusDesc.toLowerCase().includes('disqualif')) return 'withdrawn';
  return 'active';
}

function parsePosition(competitor: ESPNCompetitor): string {
  const status = parseCompetitorStatus(competitor);
  if (status === 'cut') return 'CUT';
  if (status === 'withdrawn') return 'WD';

  const order = competitor.sortOrder;
  if (order !== undefined) return `${order}`;

  return '-';
}

function parseThru(competitor: ESPNCompetitor): string {
  const displayValue = competitor.status?.displayValue;
  if (displayValue) return displayValue;

  const period = competitor.status?.period;
  const statusType = competitor.status?.type?.name || '';
  if (statusType.includes('FINAL') || statusType.includes('COMPLETE')) return 'F';
  if (period) return `R${period}`;
  return '-';
}

function parseCompetitor(competitor: ESPNCompetitor): GolferScore {
  const rounds = (competitor.linescores || [])
    .sort((a, b) => a.period - b.period)
    .map(ls => ls.value);

  return {
    name: competitor.athlete.displayName || competitor.athlete.fullName,
    espnId: competitor.id,
    score: parseScore(competitor.score),
    scoreDisplay: competitor.score || 'E',
    totalStrokes: rounds.reduce((sum, r) => sum + r, 0),
    rounds,
    position: parsePosition(competitor),
    status: parseCompetitorStatus(competitor),
    thru: parseThru(competitor),
    currentRound: competitor.status?.period || 1,
  };
}

function parseTournamentState(event: ESPNEvent): TournamentState {
  const state = event.status?.type?.state || 'pre';
  const statusMap: Record<string, TournamentState['status']> = {
    pre: 'pre',
    in: 'in',
    post: 'post',
  };

  return {
    name: event.name || 'Masters Tournament',
    status: statusMap[state] || 'pre',
    currentRound: event.competitions?.[0]?.status?.period || 1,
    cutLine: null,
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchESPNScores(): Promise<{
  scores: GolferScore[];
  tournament: TournamentState;
}> {
  // Check cache
  if (cachedScores && Date.now() - cachedScores.timestamp < CACHE_TTL) {
    return { scores: cachedScores.data, tournament: cachedScores.tournament };
  }

  const res = await fetch(ESPN_GOLF_URL, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`ESPN API returned ${res.status}`);
  }

  const data: ESPNResponse = await res.json();

  // Find the Masters event (or use the first event)
  const mastersEvent = data.events?.find(
    e => e.name?.toLowerCase().includes('masters')
  ) || data.events?.[0];

  if (!mastersEvent) {
    return {
      scores: [],
      tournament: {
        name: 'Masters Tournament',
        status: 'pre',
        currentRound: 1,
        cutLine: null,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  const tournament = parseTournamentState(mastersEvent);
  const competitors = mastersEvent.competitions?.[0]?.competitors || [];
  const scores = competitors.map(parseCompetitor);

  // Sort by score (ascending)
  scores.sort((a, b) => a.score - b.score);

  // Update cache
  cachedScores = { data: scores, tournament, timestamp: Date.now() };

  return { scores, tournament };
}

export function findGolferScore(
  scores: GolferScore[],
  golferName: string
): GolferScore | null {
  const normalized = normalizeName(golferName);
  return (
    scores.find(s => normalizeName(s.name) === normalized) ||
    scores.find(s => normalizeName(s.name).includes(normalized)) ||
    scores.find(s => normalized.includes(normalizeName(s.name))) ||
    null
  );
}
