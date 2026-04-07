import { formatScore, getScoreColor } from '@/lib/scoring';

interface ScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreIndicator({ score, size = 'md' }: ScoreIndicatorProps) {
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';
  const color = getScoreColor(score);

  return (
    <span className={`${textSize} ${color} font-bold tabular-nums`}>
      {formatScore(score)}
    </span>
  );
}
