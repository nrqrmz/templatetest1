import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { ApplicationFormDialog } from '@/components/ApplicationFormDialog'
import { ApplicationGrid } from '@/components/ApplicationGrid'
import { ImportApplicationsDialog } from '@/components/ImportApplicationsDialog'
import { ViewToggle, type View } from '@/components/ViewToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { Application } from '@/lib/types'

// Loaded on demand so the drag-and-drop library stays out of the main bundle.
const KanbanBoard = lazy(() => import('@/components/KanbanBoard'))

const VIEW_KEY = 'applications-view'

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'board'
  } catch {
    return 'board'
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [view, setView] = useState<View>(readView)

  function changeView(next: View) {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // The choice still applies for this visit.
    }
  }

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
        <>
          <ViewToggle value={view} onChange={changeView} />
          {view === 'board' ? (
            <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
              <KanbanBoard applications={applications} />
            </Suspense>
          ) : (
            <ApplicationGrid applications={applications} />
          )}
        </>
      )}

      <ImportApplicationsDialog open={importing} onOpenChange={setImporting} onImported={load} />
      <ApplicationFormDialog open={creating} onOpenChange={setCreating} onSaved={load} />
    </div>
  )
}
