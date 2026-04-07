'use client';

import useSWR from 'swr';
import { Entry, GolferScore, TournamentState, LeaderboardEntry } from './types';
import { calculateLeaderboard } from './scoring';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useScores() {
  const { data, error, isLoading } = useSWR<{
    scores: GolferScore[];
    tournament: TournamentState;
  }>('/api/scores', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  return {
    scores: data?.scores || [],
    tournament: data?.tournament || null,
    isLoading,
    error,
  };
}

export function useEntries() {
  const { data, error, isLoading, mutate } = useSWR<{ entries: Entry[] }>(
    '/api/entries',
    fetcher,
    { revalidateOnFocus: true }
  );

  return {
    entries: data?.entries || [],
    isLoading,
    error,
    mutate,
  };
}

export function useLeaderboard() {
  const { scores, tournament, isLoading: scoresLoading } = useScores();
  const { entries, isLoading: entriesLoading } = useEntries();

  const tournamentStarted = tournament?.status === 'in' || tournament?.status === 'post';
  const leaderboard: LeaderboardEntry[] = entries.length > 0
    ? calculateLeaderboard(entries, scores, tournamentStarted)
    : [];

  return {
    leaderboard,
    scores,
    tournament,
    entries,
    isLoading: scoresLoading || entriesLoading,
  };
}
