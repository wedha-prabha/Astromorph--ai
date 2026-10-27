import { firebaseAuth } from '@/auth/firebase'

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
 * All research requests use the configured FastAPI backend. There is no
 * mock-data fallback, so missing configuration is surfaced rather than
 * presenting demo content as current research.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      'The live research API is not configured. Set VITE_API_BASE_URL and restart the frontend.',
      503,
    )
  }

  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  try {
    const firebaseUser = firebaseAuth?.currentUser
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken()
      headers.set('Authorization', 'B' + 'earer ' + token)
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
    })

    if (!res.ok) {
      const detail = await readApiError(res)
      throw new ApiError(detail || ('Request failed: ' + res.status), res.status)
    }

    return res.json() as Promise<T>
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Network error. Please check your connection and try again.', 0)
  }
}

async function readApiError(res: Response): Promise<string> {
  try {
    const payload = (await res.clone().json()) as { detail?: string | { msg?: string } | Array<{ msg?: string }> }
    if (typeof payload.detail === 'string') return payload.detail
    if (typeof payload.detail === 'object' && payload.detail) {
      if ('msg' in payload.detail && payload.detail.msg) return payload.detail.msg
      if (Array.isArray(payload.detail)) {
        const [first] = payload.detail
        if (first && 'msg' in first && first.msg) return first.msg
      }
    }
  } catch {
    // Fall back to the HTTP status text for non-JSON API errors.
  }

  return res.statusText || 'Request failed.'
}
