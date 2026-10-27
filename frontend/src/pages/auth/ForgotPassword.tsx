import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { CheckCircle2 } from 'lucide-react'
import { firebaseAuth } from '@/auth/firebase'
import { getAuthErrorMessage } from '@/auth/errorMessages'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid work email address.')
      return
    }
    if (!firebaseAuth) {
      setSent(true)
      return
    }
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(firebaseAuth, email)
      setSent(true)
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Unable to send the reset email. Check the address and try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a secure reset link to your work email.">
      {sent ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <CheckCircle2 className="mx-auto size-8 text-emerald-600" aria-hidden />
          <h2 className="mt-3 font-semibold text-emerald-900">Reset link sent</h2>
          <p className="mt-1 text-sm leading-relaxed text-emerald-800">
            If an account exists for <span className="font-semibold">{email}</span>, a password reset link is on its
            way. The link expires in 30 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="reset-email">Work email</Label>
            <Input id="reset-email" type="email" placeholder="researcher@institute.org" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            {isLoading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-mutedfg">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
