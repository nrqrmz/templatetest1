import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium text-muted-foreground hover:text-foreground', isActive && 'text-foreground')

export function Navbar() {
  const { session } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-4">
        <Link to={session ? '/applications' : '/'} className="font-semibold">
          Job Tracker
        </Link>
        {session && (
          <>
            <nav className="flex items-center gap-4">
              <NavLink to="/applications" className={linkClass}>
                Applications
              </NavLink>
              <NavLink to="/tasks" className={linkClass}>
                Tasks
              </NavLink>
            </nav>
            <Button variant="outline" size="sm" className="ml-auto" onClick={signOut}>
              Sign out
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
