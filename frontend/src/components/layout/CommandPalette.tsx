import { Activity, BookOpenText, FlaskConical, Network, Pill, Search, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useAnalyses, useDiseases, useDrugs } from '@/api/hooks'
import { cn } from '@/lib/utils'

interface Result {
  id: string
  label: string
  sub: string
  kind: 'Analysis' | 'Drug' | 'Disease' | 'Page'
  to: string
}

const pages: Result[] = [
  { id: 'pg-1', label: 'New Analysis', sub: 'Start a repurposing workflow', kind: 'Page', to: '/analyses/new' },
  { id: 'pg-2', label: 'Clinical Trials', sub: 'Explorer', kind: 'Page', to: '/trials' },
  { id: 'pg-3', label: 'Literature Explorer', sub: 'Biomedical publications', kind: 'Page', to: '/literature' },
  { id: 'pg-4', label: 'Knowledge Graph', sub: 'Montelukast → COPD network', kind: 'Page', to: '/knowledge-graph' },
  { id: 'pg-5', label: 'Agent Observatory', sub: 'Live agent orchestration', kind: 'Page', to: '/agents' },
]

const kindIcons = { Analysis: Activity, Drug: Pill, Disease: Stethoscope, Page: BookOpenText }

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: drugs } = useDrugs()
  const { data: diseases } = useDiseases()
  const { data: analyses } = useAnalyses()

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
    else setQuery('')
  }, [open])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    const pool: Result[] = [
      ...(drugs ?? []).map((d) => ({ id: `drug-${d.id}`, label: d.name, sub: `${d.drugClass} · ${d.brandNames[0] ?? ''}`, kind: 'Drug' as const, to: `/drugs?id=${d.id}` })),
      ...(diseases ?? []).map((d) => ({ id: `dis-${d.id}`, label: d.name, sub: `${d.category} · ${d.icd10}`, kind: 'Disease' as const, to: `/diseases?id=${d.id}` })),
      ...(analyses ?? []).map((a) => ({ id: a.id, label: `${a.drugName} → ${a.diseaseName}`, sub: `${a.id} · ${a.status}`, kind: 'Analysis' as const, to: `/analyses/${a.id}` })),
      ...pages,
    ]
    if (!q) return pool.slice(0, 9)
    return pool.filter((r) => `${r.label} ${r.sub}`.toLowerCase().includes(q)).slice(0, 9)
  }, [query, drugs, diseases, analyses])

  function go(r: Result) {
    onOpenChange(false)
    navigate(r.to)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drugs, diseases, analyses, pages…"
            className="w-full bg-transparent py-4 text-[15px] text-navy-900 outline-none placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) go(results[0])
            }}
          />
          <kbd className="hidden rounded-md border border-line bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">ESC</kbd>
        </div>
        <ul className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-mutedfg">No matches found. Try “montelukast” or “COPD”.</li>
          )}
          {results.map((r) => {
            const Icon = kindIcons[r.kind]
            return (
              <li key={`${r.kind}-${r.id}`}>
                <button
                  type="button"
                  onClick={() => go(r)}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none')}
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-navy-900">{r.label}</span>
                    <span className="block truncate text-xs text-mutedfg">{r.sub}</span>
                  </span>
                  <span className="rounded-md border border-line bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {r.kind}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11px] text-slate-400">
          <span>Enter to open first result</span>
          <span className="inline-flex items-center gap-1">
            <FlaskConical className="size-3" aria-hidden /> ASTROMORPH Search
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
