import { KeyRound, Laptop, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/auth/AuthContext'

const dataSources = [
  { id: 'pubmed', name: 'PubMed / MEDLINE', detail: '36M+ biomedical citations', defaultOn: true },
  { id: 'ctg', name: 'ClinicalTrials.gov', detail: '480K+ registered trials', defaultOn: true },
  { id: 'fda', name: 'FDA (labels & FAERS)', detail: 'Adverse-event & regulatory data', defaultOn: true },
  { id: 'drugbank', name: 'DrugBank', detail: '15K+ curated drug entries', defaultOn: true },
  { id: 'embase', name: 'Embase', detail: 'Pharmacological literature index', defaultOn: false },
  { id: 'who', name: 'WHO ICTRP', detail: 'International trial registry portal', defaultOn: false },
]

export function SettingsPage() {
  const [sources, setSources] = useState<Record<string, boolean>>(
    Object.fromEntries(dataSources.map((s) => [s.id, s.defaultOn])),
  )
  const [threshold, setThreshold] = useState(75)
  const [twoFactor, setTwoFactor] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  function save(section: string) {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      toast({ title: `${section} saved`, description: 'Your preferences have been updated.' })
    }, 600)
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        subtitle="Manage your researcher profile, AI analysis behavior, evidence sources, and account security."
      />

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Researcher profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="s-name">Full name</Label>
                  <Input id="s-name" defaultValue={user?.name} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" type="email" defaultValue={user?.email} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-org">Organization</Label>
                  <Input id="s-org" defaultValue={user?.organization} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-role">Role</Label>
                  <Select id="s-role" defaultValue={user?.role}>
                    <option>Principal Investigator</option>
                    <option>Research Scientist</option>
                    <option>Pharmacologist</option>
                    <option>Bioinformatician</option>
                    <option>Regulatory Affairs</option>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end border-t border-line pt-4">
                <Button onClick={() => save('Profile')} loading={saving}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="max-w-2xl space-y-5">
          <Card>
            <CardHeader><CardTitle>Analysis preferences</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="s-model">Preferred AI model</Label>
                  <Select id="s-model" defaultValue="am-reasoner-v2">
                    <option value="am-reasoner-v2">ASTROMORPH Reasoner v2 (recommended)</option>
                    <option value="am-reasoner-fast">ASTROMORPH Reasoner Fast</option>
                    <option value="am-reasoner-deep">ASTROMORPH Reasoner Deep (slower)</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-citation">Citation style</Label>
                  <Select id="s-citation" defaultValue="vancouver">
                    <option value="vancouver">Vancouver (numbered)</option>
                    <option value="ama">AMA</option>
                    <option value="apa">APA 7th</option>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="s-threshold" className="text-sm">Evidence inclusion threshold</Label>
                  <span className="font-mono text-sm font-bold text-primary-700">{threshold}%</span>
                </div>
                <input
                  id="s-threshold"
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="mt-3 w-full accent-primary-600"
                  aria-valuemin={50}
                  aria-valuemax={95}
                  aria-valuenow={threshold}
                />
                <p className="mt-1.5 text-xs text-mutedfg">
                  Only sources scoring at or above this relevance level are included in synthesized reports.
                </p>
              </div>
              <div className="flex justify-end border-t border-line pt-4">
                <Button onClick={() => save('AI settings')} loading={saving}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="max-w-2xl space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Evidence connectors</CardTitle>
              <p className="text-sm text-mutedfg">Choose which public data sources agents may query during analyses.</p>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-line">
                {dataSources.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-mutedfg">{s.detail}</p>
                    </div>
                    <Switch
                      checked={sources[s.id]}
                      onCheckedChange={(v) => {
                        setSources((prev) => ({ ...prev, [s.id]: v }))
                        toast({
                          title: `${s.name} ${v ? 'connected' : 'disconnected'}`,
                          tone: v ? 'success' : 'info',
                        })
                      }}
                      aria-label={`Toggle ${s.name}`}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <KeyRound className="size-4 text-primary-600" aria-hidden />
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cur-pass">Current password</Label>
                  <Input id="cur-pass" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-pass">New password</Label>
                  <Input id="new-pass" type="password" placeholder="Min. 8 characters" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => save('Password')}>Update password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <ShieldCheck className="size-4 text-primary-600" aria-hidden />
              <CardTitle>Two-factor authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold">Authenticator app</p>
                  <p className="text-xs text-mutedfg">Require a time-based code at every sign-in.</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={(v) => { setTwoFactor(v); toast({ title: `2FA ${v ? 'enabled' : 'disabled'}`, tone: v ? 'success' : 'warning' }) }} aria-label="Toggle two-factor authentication" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <Laptop className="size-4 text-primary-600" aria-hidden />
              <CardTitle>Active sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-line">
                {[
                  ['MacBook Pro · Chrome', 'Boston, US · Current session', true],
                  ['Windows PC · Edge', 'Boston, US · 3 days ago', false],
                  ['iPad · Safari', 'Cambridge, US · Last week', false],
                ].map(([device, meta, current]) => (
                  <li key={String(device)} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        {device}
                        {current ? <Badge variant="emerald">This device</Badge> : null}
                      </p>
                      <p className="text-xs text-mutedfg">{meta}</p>
                    </div>
                    {!current && (
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => toast({ title: 'Session revoked', tone: 'info' })}>
                        Revoke
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
