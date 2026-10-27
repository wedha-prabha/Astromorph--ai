import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, Beaker, BookOpenText, Lightbulb, LoaderCircle, Sparkles, Stethoscope, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDrugSummary } from '@/api/hooks'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useDrugs } from '@/api/hooks'

export function NewAnalysisPage() {
  const [drugName, setDrugName] = useState('Montelukast')
  const [diseaseName, setDiseaseName] = useState('COPD')
  const [objective, setObjective] = useState('Evaluate the potential of Montelukast for repurposing in COPD.')
  const [debouncedInput, setDebouncedInput] = useState<{ drugName: string; diseaseName: string; objective: string } | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: drugs } = useDrugs(drugName)
  const drugSummary = useDrugSummary(debouncedInput)

  useEffect(() => {
    const trimmedDrug = drugName.trim()
    const trimmedDisease = diseaseName.trim()
    if (!trimmedDrug || !trimmedDisease) {
      setDebouncedInput(null)
      return
    }

    const timeout = window.setTimeout(() => {
      setDebouncedInput({
        drugName: trimmedDrug,
        diseaseName: trimmedDisease,
        objective: objective.trim(),
      })
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [drugName, diseaseName, objective])

  const summaryMatchesCurrentInput =
    debouncedInput?.drugName === drugName.trim() &&
    debouncedInput?.diseaseName === diseaseName.trim() &&
    debouncedInput?.objective === objective.trim()

  function handleStart() {
    if (!drugName.trim() || !diseaseName.trim()) {
      toast({ title: 'Missing information', description: 'Both a drug and a disease are required.', tone: 'warning' })
      return
    }
    navigate(`/literature?q=${encodeURIComponent(`${drugName.trim()} ${diseaseName.trim()}`)}`)
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-600">New analysis</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">Define your research question</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-mutedfg">
          Get a live, source-grounded research brief and open matching records from public biomedical sources.
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
            </div>
          </div>

          <section className="rounded-xl border border-primary-200 bg-primary-50/50 p-4" aria-live="polite">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
              <Sparkles className="size-4 text-primary-600" aria-hidden /> Live drug-repurposing brief
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-mutedfg">
              Enter a drug and condition to get an AI-generated research summary. It may take a few seconds after you
              stop typing.
            </p>
            {!drugName.trim() || !diseaseName.trim() ? (
              <p className="mt-3 text-sm text-mutedfg">Add both a drug and a condition to request a summary.</p>
            ) : summaryMatchesCurrentInput && drugSummary.isPending ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-mutedfg">
                <LoaderCircle className="size-4 animate-spin" aria-hidden /> Preparing research summary…
              </p>
            ) : summaryMatchesCurrentInput && drugSummary.isError ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-rose-700" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {drugSummary.error instanceof Error
                  ? drugSummary.error.message
                  : 'The drug summary could not be generated. Please try again.'}
              </p>
            ) : summaryMatchesCurrentInput && drugSummary.data ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {drugSummary.data.summary}
              </p>
            ) : (
              <p className="mt-3 text-sm text-mutedfg">Waiting for you to finish typing…</p>
            )}
          </section>

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
              <li>1 · Search current PubMed publications</li>
              <li>2 · Review ClinicalTrials.gov records</li>
              <li>3 · Refresh data every 15 minutes</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <DisclaimerBanner compact className="border-cyan-200/60 sm:max-w-md" />
            <Button size="lg" onClick={handleStart}>
              <BookOpenText /> Open live evidence <ArrowRight />
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
