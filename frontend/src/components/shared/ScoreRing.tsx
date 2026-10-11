import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
  tone?: 'primary' | 'emerald' | 'amber' | 'rose'
}

const gradientIds: Record<NonNullable<ScoreRingProps['tone']>, [string, string]> = {
  primary: ['#269C8E', '#0891B2'],
  emerald: ['#34D399', '#059669'],
  amber: ['#FBBF24', '#D97706'],
  rose: ['#FB7185', '#E11D48'],
}

export function ScoreRing({
  score,
  max = 100,
  size = 180,
  strokeWidth = 12,
  label,
  sublabel,
  className,
  tone = 'primary',
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(1, Math.max(0, score / max))
  const offset = circumference * (1 - pct * 0.75) // 270° arc
  const gradId = `score-ring-${tone}`

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} role="img" aria-label={`${label ?? 'Score'}: ${score} of ${max}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientIds[tone][0]} />
            <stop offset="100%" stopColor={gradientIds[tone][1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8EEF4"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75 * pct} ${circumference}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tracking-tight text-navy-900">
          {label ?? score}
          {label === undefined && <span className="text-xl font-semibold text-slate-400">/{max}</span>}
        </span>
        {sublabel && <span className="mt-1 text-xs font-medium uppercase tracking-wider text-mutedfg">{sublabel}</span>}
      </div>
    </div>
  )
}

export function MiniScoreBar({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'emerald' | 'amber' | 'sky' }) {
  const bars: Record<string, string> = {
    primary: 'bg-gradient-to-r from-primary-500 to-accent',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
  }
  return (
    <div className="flex h-1.5 w-full gap-0.5" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-sm', value > i * 10 ? bars[tone] : 'bg-slate-150 bg-slate-100')}
          style={{ opacity: value > i * 10 ? Math.min(1, 0.45 + (value - i * 10) / 100 + 0.3) : 1 }}
        />
      ))}
    </div>
  )
}
