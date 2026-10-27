import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 'Recently'

  const now = new Date()
  const diffMs = now.getTime() - then.getTime()

  if (diffMs < 0) return 'Just now'

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(iso)
}

export function formatDate(iso: string): string {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return 'Date unavailable'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export type EvidenceBand = 'Strong' | 'Moderate' | 'Preliminary' | 'Weak' | 'Insufficient'

export function scoreToBand(score: number): EvidenceBand {
  if (score >= 80) return 'Strong'
  if (score >= 65) return 'Moderate'
  if (score >= 50) return 'Preliminary'
  if (score >= 35) return 'Weak'
  return 'Insufficient'
}
