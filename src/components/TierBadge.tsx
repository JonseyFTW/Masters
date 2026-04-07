interface TierBadgeProps {
  tier: 1 | 2 | 3;
}

const tierStyles = {
  1: 'bg-masters-yellow/20 text-masters-yellow border-masters-yellow/30',
  2: 'bg-masters-accent-4/20 text-masters-accent-4 border-masters-accent-4/30',
  3: 'bg-masters-text/20 text-masters-text border-masters-text/30',
};

export default function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${tierStyles[tier]}`}
    >
      T{tier}
    </span>
  );
}
