import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/lib/types'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  due_date: z.string(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Required when creating a task. */
  applicationId?: string
  /** When set, the dialog edits this task. */
  task?: Task
  onSaved: () => void
}

export function TaskFormDialog({ open, onOpenChange, applicationId, task, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ title: task?.title ?? '', due_date: task?.due_date ?? '' })
  }, [open, task, reset])

  async function onSubmit(values: FormValues) {
    const row = { title: values.title, due_date: values.due_date || null }
    // user_id is not sent: the database fills it in with auth.uid().
    const { error } = task
      ? await supabase.from('tasks').update(row).eq('id', task.id)
      : await supabase.from('tasks').insert({ ...row, application_id: applicationId })
    if (error) return void toast.error(error.message)
    toast.success(task ? 'Task updated' : 'Task added')
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due date (optional)</Label>
            <Input id="due_date" type="date" {...register('due_date')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {task ? 'Save changes' : 'Add task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
