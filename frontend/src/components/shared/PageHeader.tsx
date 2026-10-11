import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DisclaimerBanner({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-cyan-200/70 bg-cyan-50/60 px-4 text-cyan-900',
        compact ? 'py-2.5' : 'py-3',
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-cyan-600" aria-hidden />
      <p className={cn('leading-relaxed', compact ? 'text-xs' : 'text-[13px]')}>
        <span className="font-semibold">Research use only.</span> ASTROMORPH provides AI-assisted research analysis and
        evidence synthesis. Results are not medical advice, diagnosis, or a substitute for clinical judgment.
      </p>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  eyebrow?: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary-600">{eyebrow}</p>
        )}
        <h1 className="truncate text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-mutedfg">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5 no-print">{actions}</div>}
    </div>
  )
}
