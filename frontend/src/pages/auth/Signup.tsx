import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/components/ui/toast'

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', role: 'Principal Investigator', password: '' })
  const [error, setError] = useState<string | null>(null)
  const { signUp, isLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.name.trim().length < 2) return setError('Please enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid work email address.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    try {
      await signUp(form)
      toast({ title: 'Workspace created', description: 'Welcome to ASTROMORPH.' })
      navigate('/dashboard')
    } catch {
      setError('Account creation failed. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Set up an organization workspace for your research team."
      footer="By creating an account you agree that ASTROMORPH outputs are for research use only and are not medical advice."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" placeholder="Dr. Jane Doe" value={form.name} onChange={set('name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org">Organization</Label>
            <Input id="org" autoComplete="organization" placeholder="Helix Research Institute" value={form.organization} onChange={set('organization')} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="researcher@institute.org" value={form.email} onChange={set('email')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={form.role} onChange={set('role')}>
              <option>Principal Investigator</option>
              <option>Research Scientist</option>
              <option>Pharmacologist</option>
              <option>Bioinformatician</option>
              <option>Regulatory Affairs</option>
              <option>Other</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isLoading}>
          {isLoading ? 'Creating workspace…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mutedfg">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
