import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { queryClient } from '@/api/queryClient'
import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/toast'
import { LandingPage } from '@/pages/Landing'
import { LoginPage } from '@/pages/auth/Login'
import { SignupPage } from '@/pages/auth/Signup'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { DashboardPage } from '@/pages/Dashboard'
import { NewAnalysisPage } from '@/pages/analyses/NewAnalysis'
import { AnalysisProgressPage } from '@/pages/analyses/AnalysisProgress'
import { AnalysisResultsPage } from '@/pages/analyses/AnalysisResults'
import { MyAnalysesPage } from '@/pages/MyAnalyses'
import { KnowledgeGraphPage } from '@/pages/KnowledgeGraphPage'
import { DrugIntelligencePage } from '@/pages/DrugIntelligence'
import { DiseaseIntelligencePage } from '@/pages/DiseaseIntelligence'
import { ClinicalTrialsPage } from '@/pages/ClinicalTrials'
import { LiteratureExplorerPage } from '@/pages/LiteratureExplorer'
import { AgentObservatoryPage } from '@/pages/AgentObservatory'
import { ReportsPage } from '@/pages/reports/ReportsList'
import { ReportViewerPage } from '@/pages/reports/ReportViewer'
import { SavedResearchPage } from '@/pages/SavedResearch'
import { SettingsPage } from '@/pages/Settings'
import { NotFoundPage } from '@/pages/NotFound'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="p-8 text-sm text-mutedfg">Checking your session…</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="p-8 text-sm text-mutedfg">Checking your session…</div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <RedirectIfAuthed>
                    <LoginPage />
                  </RedirectIfAuthed>
                }
              />
              <Route
                path="/signup"
                element={
                  <RedirectIfAuthed>
                    <SignupPage />
                  </RedirectIfAuthed>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <RedirectIfAuthed>
                    <ForgotPasswordPage />
                  </RedirectIfAuthed>
                }
              />

              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analyses" element={<MyAnalysesPage />} />
                <Route path="/analyses/new" element={<NewAnalysisPage />} />
                <Route path="/analyses/:id/progress" element={<AnalysisProgressPage />} />
                <Route path="/analyses/:id" element={<AnalysisResultsPage />} />
                <Route path="/drugs" element={<DrugIntelligencePage />} />
                <Route path="/diseases" element={<DiseaseIntelligencePage />} />
                <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
                <Route path="/trials" element={<ClinicalTrialsPage />} />
                <Route path="/literature" element={<LiteratureExplorerPage />} />
                <Route path="/agents" element={<AgentObservatoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:id" element={<ReportViewerPage />} />
                <Route path="/saved" element={<SavedResearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
