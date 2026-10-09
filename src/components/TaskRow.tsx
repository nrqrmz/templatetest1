import { useState, type ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { TaskFormDialog } from '@/components/TaskFormDialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  task: Task
  /** Optional extra line under the title, e.g. the related application. */
  subtitle?: ReactNode
  onChanged: () => void
}

export function TaskRow({ task, subtitle, onChanged }: Props) {
  const [editing, setEditing] = useState(false)

  async function toggle(done: boolean) {
    const { error } = await supabase.from('tasks').update({ done }).eq('id', task.id)
    if (error) return void toast.error(error.message)
    onChanged()
  }

  async function remove() {
    if (!window.confirm('Delete this task?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', task.id)
    if (error) return void toast.error(error.message)
    toast.success('Task deleted')
    onChanged()
  }

  const overdue = !task.done && task.due_date !== null && task.due_date < new Date().toLocaleDateString('en-CA')

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover">
      <input
        type="checkbox"
        className="size-5 shrink-0 cursor-pointer accent-primary"
        checked={task.done}
        onChange={(event) => toggle(event.target.checked)}
        aria-label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', task.done && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          <span className={cn(overdue && 'font-medium text-destructive')}>
            {task.due_date ? `${overdue ? 'Overdue · ' : 'Due '}${task.due_date}` : 'No due date'}
          </span>
          {subtitle}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit task">
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon" onClick={remove} aria-label="Delete task">
        <Trash2 />
      </Button>
      <TaskFormDialog open={editing} onOpenChange={setEditing} task={task} onSaved={onChanged} />
    </div>
  )
}
