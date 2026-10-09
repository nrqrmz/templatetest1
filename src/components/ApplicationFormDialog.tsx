import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { STATUSES, type Application } from '@/lib/types'

const schema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(200, 'Max 200 characters'),
  position: z.string().trim().min(1, 'Position is required').max(200, 'Max 200 characters'),
  status: z.enum(STATUSES),
  applied_on: z.string().min(1, 'Application date is required'),
  notes: z.string().max(5000, 'Max 5000 characters'),
})
type FormValues = z.infer<typeof schema>

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set, the dialog edits this application; otherwise it creates a new one. */
  application?: Application
  onSaved: () => void
}

export function ApplicationFormDialog({ open, onOpenChange, application, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset({
      company: application?.company ?? '',
      position: application?.position ?? '',
      status: application?.status ?? 'applied',
      applied_on: application?.applied_on ?? today(),
      notes: application?.notes ?? '',
    })
  }, [open, application, reset])

  async function onSubmit(values: FormValues) {
    const row = { ...values, notes: values.notes.trim() || null }
    // user_id is not sent: the database fills it in with auth.uid().
    const { error } = application
      ? await supabase.from('applications').update(row).eq('id', application.id)
      : await supabase.from('applications').insert(row)
    if (error) return void toast.error(error.message)
    toast.success(application ? 'Application updated' : 'Application added')
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{application ? 'Edit application' : 'New application'}</DialogTitle>
          <DialogDescription>Company, role and where you are in the process.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...register('company')} />
            {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" {...register('position')} />
            {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" className="capitalize" {...register('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applied_on">Application date</Label>
              <Input id="applied_on" type="date" {...register('applied_on')} />
              {errors.applied_on && <p className="text-sm text-destructive">{errors.applied_on.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...register('notes')} />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {application ? 'Save changes' : 'Add application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
