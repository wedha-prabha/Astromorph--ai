import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { KpiStat } from '@/types'
import { cn } from '@/lib/utils'

export function KpiCard({ stat }: { stat: KpiStat }) {
  const Trend = stat.deltaTone === 'up' ? ArrowUpRight : stat.deltaTone === 'down' ? ArrowDownRight : Minus
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="pointer-events-none absolute -right-6 -top-10 size-24 rounded-full bg-gradient-to-br from-primary-50 to-accent-soft opacity-80 transition-opacity group-hover:opacity-100" />
      <p className="relative text-[13px] font-medium text-mutedfg">{stat.label}</p>
      <p className="relative mt-1.5 text-[28px] font-bold leading-none tracking-tight text-navy-900">{stat.value}</p>
      <p className="relative mt-3 flex items-center gap-1.5 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
            stat.deltaTone === 'up' && 'bg-emerald-50 text-emerald-700',
            stat.deltaTone === 'down' && 'bg-rose-50 text-rose-700',
            stat.deltaTone === 'neutral' && 'bg-slate-100 text-slate-600',
          )}
        >
          <Trend className="size-3" aria-hidden />
          {stat.delta}
        </span>
      </p>
      <p className="relative mt-1 text-xs text-slate-400">{stat.hint}</p>
    </div>
  )
}
