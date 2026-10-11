import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Network,
  PlayCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'

function PipelineVisualization() {
  const stages = [
    { id: 'drug', label: 'Drug', sub: 'Montelukast' },
    { id: 'target', label: 'Target', sub: 'CysLT1 Receptor' },
    { id: 'pathway', label: 'Pathway', sub: 'Leukotriene Signaling' },
    { id: 'disease', label: 'Disease', sub: 'COPD' },
    { id: 'evidence', label: 'Clinical Evidence', sub: '23 trials · 148 papers' },
  ]

  return (
    <div className="relative mx-auto w-full max-w-3xl" aria-label="Research pipeline: drug, target, pathway, disease, clinical evidence">
      <svg viewBox="0 0 760 150" className="w-full" role="presentation">
        <defs>
          <linearGradient id="pipe-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#269C8E" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
        </defs>
        {/* connecting flow line */}
        <line x1="90" y1="75" x2="670" y2="75" stroke="url(#pipe-grad)" strokeWidth="2" strokeDasharray="6 8" className="animate-flow-dash" opacity="0.55" />
        {[110, 250, 390, 530, 650].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={75} r={i === 4 ? 26 : 22} fill="#fff" stroke="#AFE4DB" strokeWidth="2" />
            <circle cx={x} cy={75} r={i === 4 ? 26 : 22} fill="none" stroke="url(#pipe-grad)" strokeWidth="2" opacity="0.35">
              <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={75} r="6" fill="url(#pipe-grad)">
              <animate attributeName="r" values="5;7;5" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* moving pulse */}
        <circle r="5" cy="75" fill="#0891B2">
          <animate attributeName="cx" values="110;650" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.12;0.85;1" />
        </circle>
      </svg>
      <div className="-mt-8 grid grid-cols-5 gap-2 text-center">
        {stages.map((s) => (
          <div key={s.id} className="rounded-xl border border-line bg-surface/80 px-2 py-2.5 shadow-sm backdrop-blur-sm sm:px-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">{s.label}</p>
            <p className="mt-0.5 hidden truncate text-[11px] text-mutedfg sm:block">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const features = [
  {
    icon: GitBranch,
    title: 'Multi-Agent Research Pipelines',
    text: 'Nine specialized agents retrieve literature, extract entities, map pathways, screen trials, and score evidence — each step explainable and auditable.',
  },
  {
    icon: Network,
    title: 'Biomedical Knowledge Graph',
    text: 'Explore drugs, targets, pathways, diseases, and outcomes as an interconnected graph built from public biomedical sources.',
  },
  {
    icon: BookOpenText,
    title: 'Evidence-Based Synthesis',
    text: 'Every claim is traceable to publications, trial registries, regulatory labels, and curated molecular databases.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety-Aware Scoring',
    text: 'Pharmacovigilance signals and boxed warnings are integrated into every repurposing assessment before scoring.',
  },
  {
    icon: FlaskConical,
    title: 'Clinical Trial Intelligence',
    text: 'Screen thousands of ClinicalTrials.gov records filtered by phase, status, sponsor, geography, and phenotype relevance.',
  },
  {
    icon: ScrollText,
    title: 'Explainable Research Reports',
    text: 'Generate citation-backed reports covering mechanism, literature, clinical evidence, safety, gaps, and limitations.',
  },
]

const agentSteps = [
  { n: '01', title: 'Define', text: 'Enter a drug–disease pair and research objective.' },
  { n: '02', title: 'Retrieve', text: 'Agents query PubMed, ClinicalTrials.gov, FDA, DrugBank.' },
  { n: '03', title: 'Synthesize', text: 'NLP extracts relationships into the knowledge graph.' },
  { n: '04', title: 'Score & Report', text: 'Weighted evidence scoring produces an explainable report.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex" aria-label="Marketing">
            <a href="#platform" className="transition-colors hover:text-navy-900">Platform</a>
            <a href="#workflow" className="transition-colors hover:text-navy-900">How it works</a>
            <Link to="/login" className="transition-colors hover:text-navy-900">Sign in</Link>
          </nav>
          <Link
            to="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-accent px-4 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-700 hover:to-cyan-700"
          >
            Launch Platform
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-70" aria-hidden />
        <div className="pointer-events-none absolute -top-32 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-100/60 to-transparent blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-800">
              <Sparkles className="size-3.5" aria-hidden />
              Agentic AI for pharmaceutical research
            </span>
            <h1 className="text-balance mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy-900 sm:text-[54px]">
              Discover New Possibilities for{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent bg-clip-text text-transparent">Existing Drugs.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-mutedfg sm:text-lg">
              ASTROMORPH uses Agentic AI, biomedical knowledge graphs, and evidence-based research analysis to accelerate
              drug repurposing discovery.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/analyses/new"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-8 text-base font-semibold text-white shadow-lift transition-all hover:from-primary-700 hover:to-cyan-700 active:scale-[0.98] sm:w-auto"
              >
                Start New Analysis
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a
                href="#platform"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-8 text-base font-semibold text-navy-800 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
              >
                <PlayCircle className="size-5 text-primary-600" aria-hidden />
                Explore Platform
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-400">No installation required · demo workspace included</p>
          </div>

          <div className="mt-16 animate-fade-up [animation-delay:150ms]">
            <PipelineVisualization />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-10 text-center md:grid-cols-4">
          {[
            ['148M+', 'Biomedical citations indexed'],
            ['480K+', 'Clinical trial records screened'],
            ['9', 'Specialized research agents'],
            ['5', 'Weighted evidence dimensions'],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-extrabold tracking-tight text-navy-900">{v}</p>
              <p className="mt-1 text-[13px] text-mutedfg">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="platform" className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">The platform</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">
              From research question to explainable insight
            </h2>
            <p className="mt-3 leading-relaxed text-mutedfg">
              ASTROMORPH combines agentic workflows, a biomedical knowledge graph, and transparent evidence scoring so
              research teams can prioritize repurposing hypotheses with confidence.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-accent-soft ring-1 ring-primary-100">
                  <f.icon className="size-5 text-primary-700" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mutedfg">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-line bg-navy-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Agentic workflow</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Research question in. Evidence out.
              </h2>
              <p className="mt-3 leading-relaxed text-navy-200">
                Every analysis follows a transparent nine-agent pipeline — you see exactly which agent retrieved what,
                when it ran, and how conclusions were reached.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-navy-900 shadow-lift transition-transform hover:scale-[1.02]"
            >
              Create free account
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {agentSteps.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-navy-700/60 bg-navy-900/60 p-6 backdrop-blur-sm">
                <span className="font-mono text-xs font-bold text-cyan-300">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-200">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA + trust */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent shadow-lift">
            <LockKeyhole className="size-6 text-white" aria-hidden />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-900">Ready to accelerate your research?</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-mutedfg">
            Join the demo workspace and run your first drug repurposing analysis in minutes — no data science setup
            required.
          </p>
          <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {['Evidence-traceable outputs', 'Safety-aware by design', 'Research-use disclaimers enforced'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden /> {t}
              </li>
            ))}
          </ul>
          <Link
            to="/login"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-10 text-base font-semibold text-white shadow-lift transition-all hover:from-primary-700 hover:to-cyan-700"
          >
            Sign in to the demo workspace
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 sm:flex-row">
          <Logo />
          <p className="max-w-xl text-center text-xs leading-relaxed text-slate-400 sm:text-right">
            ASTROMORPH provides AI-assisted research analysis and evidence synthesis. Results are not medical advice,
            diagnosis, or a substitute for clinical judgment.
          </p>
        </div>
      </footer>
    </div>
  )
}
