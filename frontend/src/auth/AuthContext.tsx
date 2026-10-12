import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import type { User } from '@/types'
import { firebaseAuth } from '@/auth/firebase'
import { delay } from '@/lib/utils'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInDemo: () => Promise<void>
  signOut: () => Promise<void>
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

function profileKey(uid: string) {
  return `astromorph.profile.${uid}`
}

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  let profile: Pick<User, 'role' | 'organization'> = {
    role: 'Researcher',
    organization: 'Independent Research',
  }
  try {
    const rawProfile = localStorage.getItem(profileKey(firebaseUser.uid))
    if (rawProfile) profile = { ...profile, ...JSON.parse(rawProfile) }
  } catch {
    // A malformed local profile should not prevent a valid Firebase login.
  }

  const name = firebaseUser.displayName || firebaseUser.email || 'Researcher'
  return {
    id: firebaseUser.uid,
    name,
    email: firebaseUser.email ?? '',
    ...profile,
    initials: name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
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
  const [user, setUser] = useState<User | null>(() => (firebaseAuth ? null : loadStoredUser()))
  const [isLoading, setIsLoading] = useState(!!firebaseAuth)

  const persist = useCallback((u: User | null) => {
    setUser(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (!firebaseAuth) return
    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      persist(firebaseUser ? mapFirebaseUser(firebaseUser) : null)
      setIsLoading(false)
    })
  }, [persist])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      try {
        if (firebaseAuth) {
          const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
          persist(mapFirebaseUser(credential.user))
        } else {
          await delay(700)
          persist({
            ...demoUser,
            email,
            name: email === demoUser.email ? demoUser.name : 'Researcher',
            initials: email.slice(0, 2).toUpperCase(),
          })
        }
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
        if (firebaseAuth) {
          const credential = await createUserWithEmailAndPassword(firebaseAuth, input.email, input.password)
          await updateProfile(credential.user, { displayName: input.name })
          localStorage.setItem(
            profileKey(credential.user.uid),
            JSON.stringify({
              role: input.role,
              organization: input.organization || 'Independent Research',
            }),
          )
          persist(mapFirebaseUser(credential.user))
        } else {
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
        }
      } finally {
        setIsLoading(false)
      }
    },
    [persist],
  )

  const signInDemo = useCallback(async () => {
    if (firebaseAuth) throw new Error('Demo sign-in is disabled while Firebase Authentication is configured.')
    setIsLoading(true)
    try {
      await delay(500)
      persist(demoUser)
    } finally {
      setIsLoading(false)
    }
  }, [persist])

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseAuth) return signInDemo()
    setIsLoading(true)
    try {
      const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
      persist(mapFirebaseUser(credential.user))
    } finally {
      setIsLoading(false)
    }
  }, [persist, signInDemo])

  const signOut = useCallback(async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth)
    persist(null)
  }, [persist])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, signIn, signUp, signInWithGoogle, signInDemo, signOut }),
    [user, isLoading, signIn, signUp, signInWithGoogle, signInDemo, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
