import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { TaskRow } from '@/components/TaskRow'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/lib/types'

type TaskWithApplication = Task & { applications: { company: string; position: string } | null }

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithApplication[] | null>(null)

  const load = useCallback(async () => {
    // RLS limits this to the signed-in user's rows.
    const { data, error } = await supabase
      .from('tasks')
      .select('*, applications(company, position)')
      .order('done', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(error.message)
      setTasks([])
      return
    }
    setTasks(data as unknown as TaskWithApplication[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Add tasks from an application's page.
        </p>
      </div>
      {tasks === null ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks yet.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onChanged={load}
              subtitle={
                task.applications && (
                  <>
                    {' · '}
                    <Link to={`/applications/${task.application_id}`} className="underline">
                      {task.applications.position} at {task.applications.company}
                    </Link>
                  </>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
