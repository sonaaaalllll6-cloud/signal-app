interface DemandBadgeProps {
  badge: 'trending' | 'rising' | 'popular' | null;
}

const config: Record<string, { bg: string; text: string; label: string; emoji: string }> = {
  trending: { bg: 'bg-red-100', text: 'text-red-800', label: 'Trending', emoji: '🔥' },
  rising: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Rising', emoji: '📈' },
  popular: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Popular', emoji: '👀' },
};

const DemandBadge = ({ badge }: DemandBadgeProps) => {
  if (!badge) return null;
  const c = config[badge];
  if (!c) return null;
  return (
    <span className={`${c.bg} ${c.text} text-xs font-bold uppercase px-2 py-1 rounded-full inline-flex items-center gap-1`}>
      {c.emoji} {c.label}
    </span>
  );
};

export default DemandBadge;
