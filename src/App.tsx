// FILE: src/App.tsx
import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from './Pages/Home/HomePage'
import LoginPage from './Pages/LoginPage'
import SignUpPage from './Pages/Auth/SignUpPage'
import DashboardLayout from './Layouts/DashboardLayouts'
import RequireAuth from './RequireAuth'

// ---------- ErrorBoundary ----------
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }
  componentDidCatch(error: unknown, info: unknown) {
    console.error('ErrorBoundary', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm text-red-300 border border-red-500/30 rounded-lg bg-red-500/10">
          Falha ao carregar esta página. Recarregue ou tente novamente mais tarde.
        </div>
      )
    }
    return this.props.children as any
  }
}

// ---------- helper para lazy com fallback de default ----------
function lazyImport(
  importer: () => Promise<any>,
  namedExport?: string
) {
  return lazy<React.ComponentType<any>>(async () => {
    const mod = await importer()
    const Component: React.ComponentType<any> | undefined =
      (namedExport ? mod[namedExport] : mod.default) ?? mod.default
    return { default: Component ?? (() => null) }
  })
}

// ---------- Lazy imports (com helper) ----------
const DashboardHome   = lazyImport(() => import('./Pages/Dashboard/DashboardHome'))
const BotsPage        = lazyImport(() => import('./Pages/Bots/BotsPage'))
const FlowBuilderPage = lazyImport(() => import('./Pages/Flows/FlowBuilderPage'))
const FlowCanvasPage  = lazyImport(() => import('./Pages/Flows/FlowCanvasPage'))
// Ajuste para o arquivo que você tem: src/Pages/Broadcasts/BroadcastPage.tsx
const BroadcastsPage  = lazyImport(() => import('./Pages/Broadcasts/BroadcastPage'))
const ContactsPage    = lazyImport(() => import('./Pages/Contacts/ContactsPage'))
const ActivityPage    = lazyImport(() => import('./Pages/Dashboard/ActivityPage'))
const TemplatesPage   = lazyImport(() => import('./Pages/Dashboard/TemplatePage'))

export default function App() {
  const Fallback = <div className="p-4 text-sm text-gray-400">Carregando…</div>

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protegidas */}
      <Route element={<RequireAuth />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={Fallback}>
              <ErrorBoundary>
                <DashboardLayout />
              </ErrorBoundary>
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <DashboardHome />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="bots"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <BotsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="flows"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <FlowBuilderPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="flows/:id"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <FlowCanvasPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="broadcasts"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <BroadcastsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="contacts"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <ContactsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="activity"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <ActivityPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="templates"
            element={
              <Suspense fallback={Fallback}>
                <ErrorBoundary>
                  <TemplatesPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
