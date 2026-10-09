import { Briefcase, LayoutDashboard, ListChecks, LogOut, type LucideIcon } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const links: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary text-secondary-foreground shadow-xs'
      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
  )

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
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6">
        <Link to={session ? '/dashboard' : '/'} className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <Briefcase className="size-4" />
          </span>
          <span className="hidden sm:inline">Job Tracker</span>
        </Link>

        {session && (
          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass} aria-label={label}>
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {session?.user.email && (
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground lg:inline">
              {session.user.email}
            </span>
          )}
          <ThemeToggle />
          {session && (
            <Button variant="outline" size="sm" onClick={signOut} aria-label="Sign out">
              <LogOut />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
