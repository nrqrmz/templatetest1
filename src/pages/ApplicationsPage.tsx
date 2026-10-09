import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { ApplicationFormDialog } from '@/components/ApplicationFormDialog'
import { ImportApplicationsDialog } from '@/components/ImportApplicationsDialog'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { Application } from '@/lib/types'

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImporting(true)}>
            Import CSV
          </Button>
          <Button onClick={() => setCreating(true)}>New application</Button>
        </div>
      </div>

      {applications === null ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">No applications yet. Add your first one.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link key={app.id} to={`/applications/${app.id}`} className="block">
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{app.position}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {app.company} · applied {app.applied_on}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
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
