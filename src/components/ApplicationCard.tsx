import { CalendarDays } from 'lucide-react'

import { CompanyAvatar } from '@/components/CompanyAvatar'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { statusStyles } from '@/lib/status'
import type { Application } from '@/lib/types'
import { cn } from '@/lib/utils'

/** The look of one application, without any link or drag behaviour. Wrap it as needed. */
interface Props {
  application: Application
  className?: string
  /** The Kanban column already tells the status, so the board hides the badge. */
  hideStatus?: boolean
}

export function ApplicationCard({ application, className, hideStatus }: Props) {
  return (
    <Card className={cn('relative h-full gap-4 overflow-hidden transition-all duration-200', className)}>
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', statusStyles[application.status].bar)} />
      <CardContent className="flex items-start gap-3">
        <CompanyAvatar name={application.company} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{application.position}</p>
          <p className="truncate text-sm text-muted-foreground">{application.company}</p>
        </div>
      </CardContent>
      {application.notes && <p className="line-clamp-2 px-6 text-sm text-muted-foreground">{application.notes}</p>}
      <CardContent className="mt-auto flex items-center justify-between gap-2">
        {!hideStatus && <StatusBadge status={application.status} />}
        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {application.applied_on}
        </span>
      </CardContent>
    </Card>
  )
}
