import { ArrowLeft, Download, Link2, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { DisclaimerBanner } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { useReport } from '@/api/hooks'

export function ReportViewerPage() {
  const { id } = useParams()
  const { data: report, isLoading, isError, refetch } = useReport(id)
  const { toast } = useToast()

  if (isLoading) return <LoadingState rows={6} label="Loading report" />
  if (isError || !report) return <ErrorState onRetry={() => refetch()} />

  function exportMarkdown() {
    if (!report) return
    const md = [
      `# ${report.title}`,
      `${report.subtitle}`,
      ``,
      `Generated ${new Date(report.generatedAt).toDateString()} · Analysis ${report.analysisId}`,
      ``,
      ...report.sections.flatMap((s) => [`## ${s.number}. ${s.title}`, '', ...s.paragraphs.map((p) => p), '']),
      `## References`,
      '',
      ...report.references.map((r) => `- ${r.citation}`),
    ].join('\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `astromorph-report-${report.analysisId}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Export complete', description: 'Markdown file downloaded.' })
  }

  function share() {
    void navigator.clipboard?.writeText(window.location.href)
    toast({ title: 'Share link copied', description: 'Paste it to share this research report.', tone: 'info' })
  }

  function downloadPdf() {
    window.print()
    toast({ title: 'Preparing PDF', description: 'Use your browser print dialog to save as PDF.', tone: 'info' })
  }

  return (
    <div className="animate-fade-up">
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 no-print">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reports"><ArrowLeft /> All reports</Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadPdf}>
            <Download /> Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportMarkdown}>
            <Link2 /> Export
          </Button>
          <Button size="sm" onClick={share}>
            <Share2 /> Share Research
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* TOC */}
        <nav className="top-20 hidden self-start lg:sticky lg:block no-print" aria-label="Report sections">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Contents</p>
          <ol className="space-y-1.5 border-l border-line text-[13px]">
            {report.sections.map((s) => (
              <li key={s.id}>
                <a href={`#sec-${s.number}`} className="-ml-px block border-l-2 border-transparent pl-3 py-0.5 text-mutedfg transition-colors hover:border-primary-500 hover:text-primary-700">
                  {s.number}. {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#references" className="-ml-px block border-l-2 border-transparent pl-3 py-0.5 text-mutedfg transition-colors hover:border-primary-500 hover:text-primary-700">
                References
              </a>
            </li>
          </ol>
        </nav>

        {/* Report body */}
        <Card className="print-area min-w-0">
          <CardContent className="p-7 sm:p-10">
            <header className="border-b-2 border-navy-900 pb-6">
              <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-primary-700">
                <span className="inline-block h-4 w-1.5 rounded-full bg-gradient-to-b from-primary-600 to-accent" aria-hidden />
                ASTROMORPH · RESEARCH INTELLIGENCE
              </p>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{report.subtitle}</h1>
              <p className="mt-2 text-sm text-mutedfg">
                {report.title} · Generated {new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ID {report.analysisId}
              </p>
            </header>

            <DisclaimerBanner compact className="mt-6" />

            <div className="mt-8 space-y-9">
              {report.sections.slice(0, 12).map((section) => (
                <section key={section.id} id={`sec-${section.number}`}>
                  <h2 className="flex items-baseline gap-3 text-lg font-bold tracking-tight">
                    <span className="font-mono text-sm text-primary-600">{String(section.number).padStart(2, '0')}</span>
                    {section.title}
                  </h2>
                  <div className="mt-3 space-y-3.5">
                    {section.paragraphs.map((para, i) => (
                      <p key={i} className="max-w-none text-[14.5px] leading-[1.75] text-navy-800">{para}</p>
                    ))}
                  </div>
                  {section.callout && (
                    <aside className="mt-4 rounded-xl border-l-4 border-primary-500 bg-primary-50/60 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary-700">{section.callout.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-navy-800">{section.callout.text}</p>
                    </aside>
                  )}
                </section>
              ))}

              <section id="references">
                <h2 className="flex items-baseline gap-3 text-lg font-bold tracking-tight">
                  <span className="font-mono text-sm text-primary-600">13</span> References
                </h2>
                <ol className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-mutedfg">
                  {report.references.map((ref, i) => (
                    <li key={ref.id} className="pl-8 -indent-8">
                      [{i + 1}] {ref.citation}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <footer className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-slate-400">
              This report was generated by ASTROMORPH's agent pipeline using public biomedical data sources. Evidence
              scores quantify research-evidence strength only and are not predictions of clinical efficacy. Human expert
              review is required before any research or regulatory decision-making.
            </footer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
