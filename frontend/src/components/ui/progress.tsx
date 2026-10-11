import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  tone?: 'primary' | 'emerald' | 'amber' | 'sky' | 'rose' | 'navy'
}

const tones: Record<NonNullable<ProgressProps['tone']>, string> = {
  primary: 'from-primary-500 to-accent',
  emerald: 'from-emerald-400 to-emerald-600',
  amber: 'from-amber-400 to-amber-600',
  sky: 'from-sky-400 to-sky-600',
  rose: 'from-rose-400 to-rose-600',
  navy: 'from-navy-500 to-navy-700',
}

export function Progress({ value, max = 100, tone = 'primary', className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100',
        className,
      )}
      {...props}
    />
  )
}
