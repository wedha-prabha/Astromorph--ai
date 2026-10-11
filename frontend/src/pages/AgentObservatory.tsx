import { Activity, BookOpenText, Cpu, GitBranch, Network, ShieldCheck, Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const coreAgents = [
  {
    id: 'research',
    name: 'Research Agent',
    status: 'Active',
    task: 'Literature retrieval & query expansion',
    sources: ['PubMed', 'Europe PMC', 'Semantic Scholar'],
    throughput: '148 papers / run',
    icon: BookOpenText,
  },
  {
    id: 'evidence',
    name: 'Evidence Agent',
    status: 'Active',
    task: 'Evidence synthesis & relevance ranking',
    sources: ['Analysis memory', 'Vector index'],
    throughput: '412 relations / run',
    icon: GitBranch,
  },
  {
    id: 'safety',
    name: 'Safety Agent',
    status: 'Active',
    task: 'Safety & adverse-event analysis',
    sources: ['FDA FAERS', 'Drug labels', 'Pooled RCT data'],
    throughput: '41 records / run',
    icon: ShieldCheck,
  },
  {
    id: 'clinical',
    name: 'Clinical Agent',
    status: 'Active',
    task: 'Clinical-trial screening & endpoint mapping',
    sources: ['ClinicalTrials.gov', 'WHO ICTRP'],
    throughput: '23 trials / run',
    icon: Activity,
  },
  {
    id: 'kg',
    name: 'Knowledge Graph Agent',
    status: 'Idle · awaiting pipeline',
    task: 'Relationship discovery & graph projection',
    sources: ['Neo4j graph store'],
    throughput: '112 edges / run',
    icon: Network,
  },
] as const

const logTemplates = [
  ['research', 'Indexed publication "Leukotriene modifiers in COPD…" (PMID 33789456)'],
  ['biomedical-nlp', 'Extracted entity pair: Montelukast —antagonizes→ CysLT1 (conf 0.97)'],
  ['clinical', 'Screened NCT04635174 · Phase 2 · COPD · relevant=true'],
  ['kg', 'Projected edge montelukast→cyslt1 into knowledge sub-network'],
  ['safety', 'Flagged boxed warning reference from FDA label rev. 01/2020'],
  ['scoring', 'Dimension "Literature Evidence" recomputed: 91%'],
  ['research', 'Query expansion added synonym set: {COPD, chronic airflow obstruction}'],
  ['report', 'Section draft complete: "7. Clinical Trial Evidence"'],
]

function OrchestrationDiagram() {
  const positions = [
    { x: 300, y: 60 },
    { x: 480, y: 120 },
    { x: 500, y: 260 },
    { x: 100, y: 260 },
    { x: 120, y: 120 },
  ]
  return (
    <svg viewBox="0 0 600 330" className="mx-auto w-full max-w-xl" role="img" aria-label="Agent orchestration diagram">
      <defs>
        <linearGradient id="hub" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#269C8E" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      {positions.map((p, i) => (
        <line key={i} x1={300} y1={165} x2={p.x} y2={p.y} stroke="#B8C4D2" strokeWidth={1.6} strokeDasharray="5 6">
          <animate attributeName="stroke-dashoffset" values="0;-22" dur={`${1.4 + i * 0.15}s`} repeatCount="indefinite" />
        </line>
      ))}
      {coreAgents.map((a, i) => {
        const p = positions[i]
        return (
          <g key={a.id} transform={`translate(${p.x},${p.y})`}>
            <circle r={26} fill="#fff" stroke={a.status.startsWith('Active') ? '#158276' : '#CBD5E1'} strokeWidth={2} />
            {a.status.startsWith('Active') && (
              <circle r={26} fill="none" stroke="#158276" strokeWidth={2} opacity={0.4}>
                <animate attributeName="r" values="24;32;24" dur="2.8s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.8s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            )}
            <text textAnchor="middle" dy={4} fontSize={13} fontWeight={700} fill="#0C1D33">{a.name.split(' ')[0]}</text>
          </g>
        )
      })}
      <g transform={`translate(300,165)`}>
        <circle r={40} fill="url(#hub)" />
        <circle r={46} fill="none" stroke="url(#hub)" strokeWidth={1.5} opacity={0.35}>
          <animate attributeName="r" values="42;52;42" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0.05;0.35" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <text textAnchor="middle" dy={-4} fontSize={12} fontWeight={800} fill="#fff">ORCHESTRATOR</text>
        <text textAnchor="middle" dy={11} fontSize={9} fontWeight={600} fill="#D7F2EC">ASTROMORPH</text>
      </g>
    </svg>
  )
}

export function AgentObservatoryPage() {
  const [logs, setLogs] = useState<{ id: number; agent: string; msg: string }[]>([])

  useEffect(() => {
    let counter = 0
    const t = window.setInterval(() => {
      const [agent, msg] = logTemplates[counter % logTemplates.length]
      counter += 1
      setLogs((prev) => [{ id: counter, agent, msg }, ...prev].slice(0, 7))
    }, 2400)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="AI agent observatory"
        title="How ASTROMORPH's agents work"
        subtitle="An orchestrator coordinates specialized research agents through a fixed evidence pipeline. Every action is logged and traceable."
      />

      {/* Diagram */}
      <Card className="mb-6 overflow-hidden bg-gradient-to-b from-surface to-slate-50/50">
        <CardContent className="py-8">
          <OrchestrationDiagram />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agent cards */}
        <div className="space-y-4 lg:col-span-2">
          {coreAgents.map((a) => {
            const active = a.status.startsWith('Active')
            return (
              <Card key={a.id} className={cn('transition-all duration-300 hover:shadow-lift', active && 'border-primary-100')}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <span className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1',
                    active ? 'bg-primary-50 ring-primary-200' : 'bg-slate-50 ring-line',
                  )}>
                    <a.icon className={cn('size-5', active ? 'text-primary-700' : 'text-slate-400')} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-semibold">{a.name}</h3>
                      <Badge variant={active ? 'emerald' : 'neutral'}>
                        {active && <span aria-hidden className="mr-0.5 size-1.5 animate-pulse-dot rounded-full bg-emerald-500" />}
                        {a.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-mutedfg">Task: {a.task}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sources:</span>
                      {a.sources.map((s) => (
                        <Badge key={s} variant="navy" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Throughput</p>
                    <p className="font-mono text-sm font-semibold text-navy-900">{a.throughput}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Live log */}
        <div className="space-y-6">
          <Card className="bg-navy-950 text-white border-navy-900 lg:sticky lg:top-20">
            <CardHeader className="flex-row items-center gap-2 space-y-0 border-b border-navy-800 pb-4">
              <Terminal className="size-4 text-cyan-300" aria-hidden />
              <CardTitle className="!text-white text-sm">Orchestration log</CardTitle>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-cyan-300" /> live
              </span>
            </CardHeader>
            <CardContent className="min-h-[280px] pt-4 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 && <p className="text-navy-300">Waiting for events…</p>}
              {logs.map((l) => (
                <p key={l.id} className="animate-slide-up truncate text-navy-100" title={l.msg}>
                  <span className="text-cyan-400">[{l.agent}]</span> {l.msg}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <Cpu className="size-4 text-primary-600" aria-hidden />
              <CardTitle className="text-sm">Pipeline template</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1.5 text-[13px] text-mutedfg">
                {['Query Validation', 'Literature Retrieval', 'Biomedical NLP', 'Knowledge Graph', 'Molecular Evidence', 'Clinical Trial', 'Safety Analysis', 'Evidence Scoring', 'Report Generation'].map((step, i) => (
                  <li key={step} className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-md bg-primary-50 font-mono text-[10px] font-bold text-primary-700">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
