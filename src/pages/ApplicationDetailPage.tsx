import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ApplicationFormDialog } from '@/components/ApplicationFormDialog'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import type { Application } from '@/lib/types'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState<Application | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('applications').select('*').eq('id', id).maybeSingle()
    if (error) toast.error(error.message)
    setApplication((data as Application | null) ?? null)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function remove() {
    if (!application) return
    if (!window.confirm('Delete this application and all of its tasks?')) return
    const { error } = await supabase.from('applications').delete().eq('id', application.id)
    if (error) return void toast.error(error.message)
    toast.success('Application deleted')
    navigate('/applications')
  }

  if (application === undefined) return <p className="text-muted-foreground">Loading...</p>
  if (application === null) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Application not found.</p>
        <Button asChild variant="outline">
          <Link to="/applications">Back to applications</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/applications" className="text-sm text-muted-foreground hover:text-foreground">
        ← Applications
      </Link>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">{application.position}</CardTitle>
            <p className="text-muted-foreground">
              {application.company} · applied {application.applied_on}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          {application.notes && <p className="whitespace-pre-wrap text-sm">{application.notes}</p>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={remove}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <ApplicationFormDialog
        open={editing}
        onOpenChange={setEditing}
        application={application}
        onSaved={load}
      />
    </div>
  )
}
