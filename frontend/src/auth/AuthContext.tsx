import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { delay } from '@/lib/utils'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signInDemo: () => Promise<void>
  signOut: () => void
}

export interface SignUpInput {
  name: string
  email: string
  organization: string
  role: string
  password: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'astromorph.user'

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

const demoUser: User = {
  id: 'usr-001',
  name: 'Dr. Elena Fisher',
  email: 'e.fisher@helixresearch.org',
  role: 'Principal Investigator',
  organization: 'Helix Research Institute',
  initials: 'EF',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser)
  const [isLoading, setIsLoading] = useState(false)

  const persist = useCallback((u: User | null) => {
    setUser(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const signIn = useCallback(
    async (email: string, _password: string) => {
      setIsLoading(true)
      try {
        await delay(700)
        persist({
          ...demoUser,
          email,
          name: email === demoUser.email ? demoUser.name : 'Researcher',
          initials: email.slice(0, 2).toUpperCase(),
        })
      } finally {
        setIsLoading(false)
      }
    },
    [persist],
  )

  const signUp = useCallback(
    async (input: SignUpInput) => {
      setIsLoading(true)
      try {
        await delay(900)
        persist({
          id: `usr-${Date.now()}`,
          name: input.name,
          email: input.email,
          role: input.role,
          organization: input.organization || 'Independent Research',
          initials: input.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase(),
        })
      } finally {
        setIsLoading(false)
      }
    },
    [persist],
  )

  const signInDemo = useCallback(async () => {
    setIsLoading(true)
    try {
      await delay(500)
      persist(demoUser)
    } finally {
      setIsLoading(false)
    }
  }, [persist])

  const signOut = useCallback(() => {
    persist(null)
  }, [persist])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, signIn, signUp, signInDemo, signOut }),
    [user, isLoading, signIn, signUp, signInDemo, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
