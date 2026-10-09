import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/auth'

/** Renders the nested routes only for signed-in users; everyone else goes to "/". */
export function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return <p className="text-muted-foreground">Loading...</p>
  if (!session) return <Navigate to="/" replace />
  return <Outlet />
}
