import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'

import { Navbar } from '@/components/Navbar'
import { RequireAuth } from '@/components/RequireAuth'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import TasksPage from '@/pages/TasksPage'

// Loaded on demand so the charting library stays out of the main bundle.
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

// All routes live here.
export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<RequireAuth />}>
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
