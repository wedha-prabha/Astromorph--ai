import { useState } from 'react'
import { ArrowRight, Beaker, FlaskConical, Lightbulb, Stethoscope, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useAnalyses, useDrugs } from '@/api/hooks'
import { formatRelativeTime } from '@/lib/utils'

export function NewAnalysisPage() {
  const [drugName, setDrugName] = useState('Montelukast')
  const [diseaseName, setDiseaseName] = useState('COPD')
  const [objective, setObjective] = useState('Evaluate the potential of Montelukast for repurposing in COPD.')
  const [starting, setStarting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: drugs } = useDrugs()
  const { data: analyses } = useAnalyses()

  function handleStart() {
    if (!drugName.trim() || !diseaseName.trim()) {
      toast({ title: 'Missing information', description: 'Both a drug and a disease are required.', tone: 'warning' })
      return
    }
    setStarting(true)
    setTimeout(() => {
      navigate('/analyses/AST-2026-001/progress', {
        state: { drugName: drugName.trim(), diseaseName: diseaseName.trim(), objective },
      })
    }, 600)
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-600">New analysis</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">Define your research question</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-mutedfg">
          ASTROMORPH will deploy its research agents to retrieve literature, map mechanisms, screen clinical trials, and
          synthesize an explainable evidence assessment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1 — Research question</CardTitle>
          <CardDescription>All fields except drug and disease are optional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="drug" className="flex items-center gap-1.5">
                <Beaker className="size-3.5 text-primary-600" aria-hidden /> Drug name
              </Label>
              <Input id="drug" list="drug-suggestions" placeholder="e.g., Montelukast" value={drugName} onChange={(e) => setDrugName(e.target.value)} />
              <datalist id="drug-suggestions">
                {(drugs ?? []).map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disease" className="flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary-600" aria-hidden /> Disease / condition
              </Label>
              <Input id="disease" list="disease-suggestions" placeholder="e.g., COPD" value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)} />
              <datalist id="disease-suggestions">
                <option value="COPD" />
                <option value="Idiopathic Pulmonary Fibrosis" />
                <option value="Alzheimer's Disease" />
                <option value="Colorectal Cancer" />
                <option value="Bronchopulmonary Dysplasia" />
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objective" className="flex items-center gap-1.5">
              <Lightbulb className="size-3.5 text-primary-600" aria-hidden /> Research objective{' '}
              <span className="font-normal text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe what you want to evaluate — e.g., mechanism relevance, safety constraints, target patient phenotype…"
            />
          </div>

          <div className="rounded-xl border border-line bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Timer className="size-3.5" aria-hidden /> What happens next
            </p>
            <ol className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-mutedfg sm:grid-cols-3">
              <li>1 · Nine agents run in sequence</li>
              <li>2 · ~90 seconds simulated runtime</li>
              <li>3 · Evidence report & score generated</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <DisclaimerBanner compact className="border-cyan-200/60 sm:max-w-md" />
            <Button size="lg" onClick={handleStart} loading={starting}>
              {starting ? 'Deploying agents…' : 'Start Analysis'} {!starting && <ArrowRight />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent examples */}
      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-900">
          <FlaskConical className="size-4 text-primary-600" aria-hidden /> Recently analyzed pairs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(analyses ?? []).slice(0, 3).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                navigate(`/analyses/${a.id}`, { state: { drugName: a.drugName, diseaseName: a.diseaseName } })
              }
              className="group rounded-xl border border-line bg-surface p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lift"
            >
              <p className="font-mono text-[11px] text-slate-400">{a.id}</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">
                {a.drugName} → {a.diseaseName}
              </p>
              <p className="mt-1 text-xs text-mutedfg">{formatRelativeTime(a.updatedAt)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
