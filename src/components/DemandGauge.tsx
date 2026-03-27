interface DemandGaugeProps {
  score: number;
}

const DemandGauge = ({ score }: DemandGaugeProps) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const angle = (clampedScore / 100) * 180;

  let color = 'hsl(var(--text-muted))';
  if (clampedScore >= 80) color = 'hsl(var(--trending))';
  else if (clampedScore >= 50) color = 'hsl(var(--rising))';
  else if (clampedScore >= 20) color = 'hsl(var(--popular))';

  const startAngle = 180;
  const endAngle = startAngle - angle;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const cx = 60, cy = 60, r = 45;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy - r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy - r * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="80" viewBox="0 0 120 80">
        <path
          d={`M 15 60 A 45 45 0 0 1 105 60`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {clampedScore > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="text-lg font-bold text-foreground -mt-2">{Math.round(clampedScore)}</span>
    </div>
  );
};

export default DemandGauge;
