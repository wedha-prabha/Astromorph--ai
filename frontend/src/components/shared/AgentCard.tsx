import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import type { AgentRun } from '@/types'
import { cn } from '@/lib/utils'

export function AgentStatusIcon({ status }: { status: AgentRun['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
          <CheckCircle2 className="size-4 text-emerald-600" aria-label="Completed" />
        </span>
      )
    case 'processing':
      return (
        <span className="flex size-7 items-center justify-center rounded-full bg-cyan-50 ring-1 ring-cyan-200">
          <Loader2 className="size-4 animate-spin text-cyan-600" aria-label="Processing" />
        </span>
      )
    default:
      return (
        <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
          <Circle className="size-3.5 text-slate-400" aria-label="Waiting" />
        </span>
      )
  }
}

export function AgentCard({ agent, active }: { agent: AgentRun; active?: boolean }) {
  const statusLabel = agent.status === 'completed' ? 'Completed' : agent.status === 'processing' ? 'Processing' : agent.status === 'error' ? 'Error' : 'Waiting'
  const labelColor =
    agent.status === 'completed'
      ? 'text-emerald-700'
      : agent.status === 'processing'
        ? 'text-cyan-700'
        : 'text-slate-500'

  return (
    <div
      className={cn(
        'relative flex gap-4 rounded-2xl border bg-surface p-5 shadow-soft transition-all duration-300',
        agent.status === 'processing' && 'border-cyan-300 ring-2 ring-cyan-100',
        agent.status === 'waiting' && 'opacity-80',
        agent.status === 'completed' && 'border-line hover:border-primary-200 hover:shadow-lift',
        active && 'scale-[1.01]',
      )}
    >
      <AgentStatusIcon status={agent.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h3 className="text-sm font-semibold text-navy-900">{agent.name}</h3>
          <span className={cn('text-xs font-semibold', labelColor)}>{statusLabel}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-mutedfg">{agent.activity}</p>
        {(agent.durationSec !== null || agent.sources !== null || agent.detail) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            {agent.durationSec !== null && <span>{agent.durationSec.toFixed(1)}s processing</span>}
            {agent.sources !== null && agent.sources > 0 && <span>{agent.sources} sources</span>}
            {agent.detail && <span className="font-mono text-[11px] text-slate-400">{agent.detail}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
