import { cn } from '@/lib/utils'

export type Band = 'Strong' | 'Moderate' | 'Preliminary' | 'Weak' | 'Insufficient'

const bandStyles: Record<Band, string> = {
  Strong: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Moderate: 'border-amber-200 bg-amber-50 text-amber-800',
  Preliminary: 'border-sky-200 bg-sky-50 text-sky-700',
  Weak: 'border-slate-200 bg-slate-100 text-slate-600',
  Insufficient: 'border-rose-200 bg-rose-50 text-rose-700',
}

const bandDots: Record<Band, string> = {
  Strong: 'bg-emerald-500',
  Moderate: 'bg-amber-500',
  Preliminary: 'bg-sky-500',
  Weak: 'bg-slate-400',
  Insufficient: 'bg-rose-500',
}

export function EvidenceBadge({ band, score, className }: { band?: string | null; score?: number | null; className?: string }) {
  if (!band) return <span className={cn('text-xs italic text-slate-400', className)}>Pending</span>
  const key = (band in bandStyles ? band : 'Weak') as Band
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        bandStyles[key],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', bandDots[key])} aria-hidden />
      {band}
      {score !== undefined && score !== null && <span className="font-medium opacity-75">· {score}%</span>}
    </span>
  )
}

const statusStyles: Record<string, string> = {
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Processing: 'border-amber-200 bg-amber-50 text-amber-800',
  Queued: 'border-slate-200 bg-slate-50 text-slate-600',
  Failed: 'border-rose-200 bg-rose-50 text-rose-700',
  Recruiting: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  'Active, not recruiting': 'border-violet-200 bg-violet-50 text-violet-700',
  Terminated: 'border-rose-200 bg-rose-50 text-rose-700',
  'Not yet recruiting': 'border-slate-200 bg-slate-50 text-slate-600',
}

export function StatusPill({ status, pulse }: { status: string; pulse?: boolean }) {
  const style = statusStyles[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold', style)}>
      {pulse && <span className="size-1.5 animate-pulse-dot rounded-full bg-current" aria-hidden />}
      {status}
    </span>
  )
}

export function RelevanceMeter({ value }: { value: number }) {
  const tone = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-primary-500' : value >= 55 ? 'bg-amber-500' : 'bg-slate-400'
  return (
    <div className="flex items-center gap-2" title={`Relevance ${value}%`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full transition-all duration-500', tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-navy-800">{value}%</span>
    </div>
  )
}
