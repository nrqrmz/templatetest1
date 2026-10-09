import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Plus, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { ApplicationFormDialog } from '@/components/ApplicationFormDialog'
import { ImportApplicationsDialog } from '@/components/ImportApplicationsDialog'
import { CompanyAvatar } from '@/components/CompanyAvatar'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { statusStyles } from '@/lib/status'
import { supabase } from '@/lib/supabase'
import type { Application } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)

  const load = useCallback(async () => {
    // RLS limits this to the signed-in user's rows.
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_on', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(error.message)
      setApplications([])
      return
    }
    setApplications(data as Application[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          {applications && applications.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {applications.length} application{applications.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImporting(true)}>
            <Upload /> Import CSV
          </Button>
          <Button variant="brand" onClick={() => setCreating(true)}>
            <Plus /> New application
          </Button>
        </div>
      </div>

      {applications === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-medium">No applications yet</p>
            <p className="text-sm text-muted-foreground">Add your first one, or import several from a CSV file.</p>
            <Button variant="brand" onClick={() => setCreating(true)}>
              <Plus /> New application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app, index) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="group animate-in fade-in slide-in-from-bottom-2 rounded-2xl fill-mode-backwards duration-500 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
            >
              <Card className="relative h-full gap-4 overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', statusStyles[app.status].bar)} />
                <CardContent className="flex items-start gap-3">
                  <CompanyAvatar name={app.company} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{app.position}</p>
                    <p className="truncate text-sm text-muted-foreground">{app.company}</p>
                  </div>
                </CardContent>
                {app.notes && <p className="line-clamp-2 px-6 text-sm text-muted-foreground">{app.notes}</p>}
                <CardContent className="mt-auto flex items-center justify-between gap-2">
                  <StatusBadge status={app.status} />
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {app.applied_on}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ImportApplicationsDialog open={importing} onOpenChange={setImporting} onImported={load} />
      <ApplicationFormDialog open={creating} onOpenChange={setCreating} onSaved={load} />
    </div>
  )
}
