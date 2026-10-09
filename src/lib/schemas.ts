import { z } from 'zod'

import { STATUSES } from '@/lib/types'

export const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(200, 'Max 200 characters'),
  position: z.string().trim().min(1, 'Position is required').max(200, 'Max 200 characters'),
  status: z.enum(STATUSES),
  applied_on: z.string().min(1, 'Application date is required'),
  notes: z.string().max(5000, 'Max 5000 characters'),
})
export type ApplicationValues = z.infer<typeof applicationSchema>
