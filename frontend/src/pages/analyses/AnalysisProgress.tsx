import { CheckCircle2, ChevronRight, CircleDashed, Cpu, Loader2, PauseCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AgentCard } from '@/components/shared/AgentCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress, Skeleton } from '@/components/ui/progress'
import { useAnalysisAgents } from '@/api/hooks'
import type { AgentRun } from '@/types'

type Phase = 'running' | 'done'

const STEP_MS = 1500

export function AnalysisProgressPage() {
  const params = useParams<{ id: string }>()
  const analysisId = params.id ?? 'AST-2026-001'
  const location = useLocation() as { state?: { drugName?: string; diseaseName?: string; objective?: string } }
  const navigate = useNavigate()
  const { data: agentsTemplate, isLoading: templateLoading } = useAnalysisAgents(analysisId)
  const [agents, setAgents] = useState<AgentRun[]>([])
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState<Phase>('running')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (agentsTemplate && agents.length === 0) {
      setAgents(agentsTemplate.map((a) => ({ ...a, status: 'waiting', durationSec: null, sources: null, detail: undefined })))
    }
  }, [agentsTemplate, agents.length])

  useEffect(() => {
    if (phase !== 'running' || agents.length === 0) return
    if (timerRef.current) window.clearInterval(timerRef.current)

    timerRef.current = window.setInterval(() => setElapsed((e) => e + 0.1), 100)

    const stepTimer = window.setInterval(() => {
      setCurrent((c) => {
        setAgents((prev) => {
          const next = [...prev]
          if (next[c]) next[c] = { ...next[c], status: 'completed' }
          if (next[c + 1]) next[c + 1] = { ...next[c + 1], status: 'processing' }
          return next
        })
        return c + 1
      })
    }, STEP_MS)

    return () => {
      window.clearInterval(stepTimer)
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [phase, agents.length])

  useEffect(() => {
    if (agents.length > 0 && current >= agents.length && phase === 'running') {
      setPhase('done')
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [current, agents.length, phase])

  const progressPct = useMemo(
    () => Math.min(100, Math.round(((agents.length ? current : 0) / Math.max(1, agents.length)) * 100)),
    [current, agents.length],
  )

  const drugName = location.state?.drugName ?? 'Montelukast'
  const diseaseName = location.state?.diseaseName ?? 'COPD'

  function finish() {
    navigate(`/analyses/${analysisId}`)
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Agent pipeline running</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            {drugName} → {diseaseName}
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-400">{analysisId}</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-sm">
          {phase === 'running' ? (
            <>
              <Loader2 className="size-4 animate-spin text-cyan-600" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">In progress</p>
                <p className="font-mono text-[11px] text-mutedfg">{elapsed.toFixed(1)}s elapsed</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Pipeline complete</p>
                <p className="font-mono text-[11px] text-mutedfg">{elapsed.toFixed(1)}s total</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <Card className="mb-6">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-navy-900">
              <Cpu className="size-4 text-primary-600" aria-hidden />
              {phase === 'running' ? `Running agent ${Math.min(current + 1, agents.length)} of ${agents.length}` : 'All agents finished'}
            </span>
            <span className="font-mono text-sm tabular-nums text-mutedfg">{progressPct}%</span>
          </div>
          <Progress value={progressPct} />
          {location.state?.objective && (
            <p className="border-t border-line pt-3 text-xs leading-relaxed text-mutedfg">
              <span className="font-semibold text-navy-800">Objective:</span> {location.state.objective}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pipeline */}
      {templateLoading || agents.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="relative space-y-3">
          <span aria-hidden className="absolute bottom-8 left-[46px] top-8 hidden w-px bg-gradient-to-b from-primary-200 via-line to-transparent sm:block" />
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className={i <= current ? 'animate-fade-up' : undefined}
              style={i > current ? { opacity: 0.6, animationDelay: `${i * 60}ms` } : undefined}
            >
              <AgentCard agent={{ ...agent, status: agent.status }} active={i === current} />
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/90 p-4 shadow-lift backdrop-blur-md no-print">
        <p className="flex items-center gap-2 text-sm text-mutedfg">
          {phase === 'running' ? (
            <>
              <PauseCircle className="size-4 text-slate-400" aria-hidden />
              You can skip ahead — results are already synthesized in this demo.
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
              Evidence synthesis complete. Review the full assessment.
            </>
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          {phase === 'running' ? (
            <Button variant="ghost" size="sm" onClick={() => {
              setAgents((prev) => prev.map((a) => ({ ...a, status: 'completed' })))
              setCurrent(agents.length)
              setPhase('done')
            }}>
              <CircleDashed /> Skip to results
            </Button>
          ) : (
            <Button size="sm" onClick={finish}>
              View evidence results <ChevronRight />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Simulated runtimes shown. In production, connect a live backend via{' '}
        <Link to="/settings" className="underline hover:text-primary-600">API settings</Link>.
      </p>
    </div>
  )
}
