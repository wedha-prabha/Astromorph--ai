import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useAuth } from '@/auth/AuthContext'
import { firebaseAuth } from '@/auth/firebase'
import { useToast } from '@/components/ui/toast'
import { getAuthErrorMessage } from '@/auth/errorMessages'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
    </svg>
  )
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle, signInDemo, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const { toast } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid work email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    try {
      await signIn(email, password)
      toast({ title: 'Welcome back', description: 'Signed in to the ASTROMORPH workspace.' })
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Sign-in failed. Please try again.'))
    }
  }

  return (
    <AuthLayout
      title="Sign in to ASTROMORPH"
      subtitle="Access your research workspace and active analyses."
    >
      {firebaseAuth && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          loading={isLoading}
          onClick={async () => {
            try {
              await signInWithGoogle()
              toast({ title: 'Signed in with Google', description: 'Welcome to the ASTROMORPH workspace.' })
              navigate('/dashboard')
            } catch (error) {
              setError(getAuthErrorMessage(error, 'Google sign-in failed. Please try again.'))
            }
          }}
        >
          <GoogleIcon /> Continue with Google
        </Button>
      )}

      {firebaseAuth && (
        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="researcher@institute.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {!firebaseAuth && <button
        type="button"
        onClick={async () => {
          await signInDemo()
          navigate('/dashboard')
        }}
        className="mt-4 w-full rounded-lg border border-dashed border-primary-300 bg-primary-50/60 px-4 py-2.5 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-50"
      >
        Skip ahead with the demo researcher account →
      </button>}

      <p className="mt-6 text-center text-sm text-mutedfg">
        New to ASTROMORPH?{' '}
        <Link to="/signup" className="font-semibold text-primary-700 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
