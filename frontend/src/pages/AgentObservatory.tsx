import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const sources = [
  {
    name: 'PubMed',
    role: 'Biomedical publication records and abstracts',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    refresh: 'Queried when literature is searched',
  },
  {
    name: 'ClinicalTrials.gov',
    role: 'Registered clinical study records',
    url: 'https://clinicaltrials.gov/',
    refresh: 'Queried when trials are searched',
  },
  {
    name: 'OpenFDA',
    role: 'FDA-submitted drug labeling',
    url: 'https://open.fda.gov/apis/drug/label/',
    refresh: 'Queried when a drug profile is opened',
  },
  {
    name: 'EBI Disease Ontology',
    role: 'Disease terms and definitions',
    url: 'https://www.ebi.ac.uk/ols4/',
    refresh: 'Queried when a disease is searched',
  },
  {
    name: 'Google Gemini',
    role: 'Research-only synthesis of retrieved source records',
    url: 'https://ai.google.dev/gemini-api',
    refresh: 'Generated for the current drug and condition',
  },
]

export function AgentObservatoryPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Data sources"
        title="Live biomedical data integrations"
        subtitle="Records are retrieved from their public source when requested. Active data queries are refreshed every 15 minutes while the page is open."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((source) => (
          <Card key={source.name}>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{source.name}</CardTitle>
                <p className="mt-1 text-sm text-mutedfg">{source.role}</p>
              </div>
              <Badge variant="outline">Source</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <span className="text-xs text-mutedfg">{source.refresh}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
              >
                Visit source <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-mutedfg">
        Source availability, update cadence, and record completeness are controlled by each provider. A source
        result is not a clinical recommendation. Pathway, genetic, and repurposing scores are not currently supplied
        by these integrations.
      </p>
    </div>
  )
}
