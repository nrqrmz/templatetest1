import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ApplicationFormDialog } from '@/components/ApplicationFormDialog'
import { CompanyAvatar } from '@/components/CompanyAvatar'
import { StatusBadge } from '@/components/StatusBadge'
import { TaskFormDialog } from '@/components/TaskFormDialog'
import { TaskRow } from '@/components/TaskRow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusStyles } from '@/lib/status'
import { supabase } from '@/lib/supabase'
import type { Application, Task } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState<Application | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [addingTask, setAddingTask] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('applications').select('*').eq('id', id).maybeSingle()
    if (error) toast.error(error.message)
    setApplication((data as Application | null) ?? null)
  }, [id])

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('application_id', id)
      .order('done', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
    if (error) return void toast.error(error.message)
    setTasks(data as Task[])
  }, [id])

  useEffect(() => {
    load()
    loadTasks()
  }, [load, loadTasks])

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
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/applications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Applications
      </Link>
      <Card className="relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', statusStyles[application.status].bar)} />
        <CardHeader className="flex flex-row items-start gap-4">
          <CompanyAvatar name={application.company} className="size-14 text-base" />
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-xl">{application.position}</CardTitle>
            <p className="text-muted-foreground">{application.company}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" /> Applied {application.applied_on}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          {application.notes && (
            <p className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm">{application.notes}</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={remove}>
              <Trash2 /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <Button variant="brand" size="sm" onClick={() => setAddingTask(true)}>
            <Plus /> New task
          </Button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks for this application yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onChanged={loadTasks} />
            ))}
          </div>
        )}
      </section>

      <TaskFormDialog
        open={addingTask}
        onOpenChange={setAddingTask}
        applicationId={application.id}
        onSaved={loadTasks}
      />
      <ApplicationFormDialog
        open={editing}
        onOpenChange={setEditing}
        application={application}
        onSaved={load}
      />
    </div>
  )
}
