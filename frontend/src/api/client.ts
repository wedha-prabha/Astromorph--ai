import { delay } from '@/lib/utils'
import { firebaseAuth } from '@/auth/firebase'
import type {
  ActivityEvent,
  AgentRun,
  Analysis,
  AnalysisSummary,
  ClinicalTrial,
  Disease,
  Drug,
  EvidenceSource,
  KnowledgeGraphData,
  Paper,
  ResearchReport,
} from '@/types'
import { allDiseases } from './mock/diseases'
import { allDrugs } from './mock/drugs'
import { activityTimeline, analysisAst2026001, agents, recentAnalyses } from './mock/analysis'
import { evidenceSources } from './mock/evidence'
import { trials as allTrials } from './mock/trials'
import { papers as allPapers } from './mock/literature'
import { knowledgeGraph } from './mock/knowledgeGraph'
import { reportAst2026001, savedItems, notifications, kpiStats } from './mock/report'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface AnalysisInput {
  drugName: string
  diseaseName: string
  objective?: string
}

/**
 * Central transport layer.
 *
 * When VITE_API_BASE_URL is configured, requests hit the real backend
 * (FastAPI). Otherwise a local mock adapter serves realistic demo data
 * with simulated latency so UI states (loading/error) behave identically.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) return mockRequest<T>(path)

  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const firebaseUser = firebaseAuth?.currentUser
  if (firebaseUser) headers.set('Authorization', `Bearer ${await firebaseUser.getIdToken()}`)

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  })
  if (!res.ok) throw new ApiError(`Request failed: ${res.status}`, res.status)
  return res.json() as Promise<T>
}

/* ------------------------------------------------------------------ */
/* Mock adapter — mirrors the FastAPI contract in .env.example         */
/* ------------------------------------------------------------------ */

async function mockRequest<T>(rawPath: string): Promise<T> {
  await delay(260 + Math.random() * 380)
  const [pathOnly, queryString] = rawPath.split('?')
  const path = pathOnly.replace(/\/$/, '').replace(/^\/api/, '')
  const q = new URLSearchParams(queryString ?? '')
  let m: RegExpMatchArray | null

  // --- drugs ---
  if (path === '/drugs') return allDrugs as T
  m = path.match(/^\/drugs\/([\w-]+)$/)
  if (m) {
    const drug = allDrugs.find((d) => d.id === m![1])
    if (!drug) throw new ApiError('Drug not found', 404)
    return drug as T
  }

  // --- diseases ---
  if (path === '/diseases') return allDiseases as T
  m = path.match(/^\/diseases\/([\w-]+)$/)
  if (m) {
    const disease = allDiseases.find((d) => d.id === m![1])
    if (!disease) throw new ApiError('Disease not found', 404)
    return disease as T
  }

  // --- analyses ---
  if (path === '/analyses') return recentAnalyses as unknown as T
  m = path.match(/^\/analyses\/([\w-]+)$/)
  if (m && !path.includes('/agents') && !path.includes('/evidence') && !path.includes('/knowledge-graph') && !path.includes('/report')) {
    if (m[1] === analysisAst2026001.id) return analysisAst2026001 as T
    const summary = recentAnalyses.find((a) => a.id === m![1])
    if (!summary) throw new ApiError('Analysis not found', 404)
    return {
      ...analysisAst2026001,
      id: summary.id,
      drugName: summary.drugName,
      diseaseName: summary.diseaseName,
      status: summary.status,
      title: `${summary.drugName} → ${summary.diseaseName}`,
    } as T
  }
  m = path.match(/^\/analyses\/([\w-]+)\/agents$/)
  if (m) return agents as T

  m = path.match(/^\/analyses\/([\w-]+)\/evidence$/)
  if (m) {
    const type = q.get('type')
    let rows = evidenceSources.filter((e) => e.analysisId === m![1])
    if (rows.length === 0) rows = [...evidenceSources]
    if (type && type !== 'All') rows = rows.filter((e) => e.type === type)
    return rows as T
  }

  m = path.match(/^\/analyses\/([\w-]+)\/knowledge-graph$/)
  if (m) return knowledgeGraph as T

  m = path.match(/^\/analyses\/([\w-]+)\/report$/)
  if (m) return reportAst2026001 as T

  // --- platform data ---
  if (path === '/activity') return activityTimeline as T
  if (path === '/stats') return kpiStats as T

  if (path === '/clinical-trials') {
    let rows = [...allTrials]
    const drug = q.get('drug')
    const phase = q.get('phase')
    const status = q.get('status')
    const country = q.get('country')
    const sponsor = q.get('sponsor')
    if (drug && drug !== 'All') rows = rows.filter((t) => t.drug.toLowerCase().includes(drug.toLowerCase()))
    if (phase && phase !== 'All') rows = rows.filter((t) => t.phase === phase)
    if (status && status !== 'All') rows = rows.filter((t) => t.status === status)
    if (country && country !== 'All') rows = rows.filter((t) => t.locations.some((l) => l.country === country))
    if (sponsor && sponsor !== 'All') rows = rows.filter((t) => t.sponsor === sponsor)
    return rows as T
  }

  if (path === '/literature') {
    let rows = [...allPapers]
    const search = (q.get('q') ?? '').toLowerCase()
    const level = q.get('level')
    const journal = q.get('journal')
    const studyType = q.get('studyType')
    const yearFrom = q.get('yearFrom')
    if (search) {
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.authors.toLowerCase().includes(search) ||
          p.journal.toLowerCase().includes(search) ||
          p.abstractSnippet.toLowerCase().includes(search),
      )
    }
    if (level && level !== 'All') rows = rows.filter((p) => p.evidenceLevel.startsWith(level))
    if (journal && journal !== 'All') rows = rows.filter((p) => p.journal === journal)
    if (studyType && studyType !== 'All') rows = rows.filter((p) => p.studyType === studyType)
    if (yearFrom) rows = rows.filter((p) => p.year >= Number(yearFrom))
    return rows as T
  }

  if (path === '/saved') return savedItems as T
  if (path === '/notifications') return notifications as T

  throw new ApiError(`Mock route not implemented: ${path}`, 404)
}
