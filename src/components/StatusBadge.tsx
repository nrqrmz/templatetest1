import { Badge } from '@/components/ui/badge'
import { statusStyles } from '@/lib/status'
import type { Status } from '@/lib/types'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: Status }) {
  const style = statusStyles[status]
  return (
    <Badge variant="outline" className={cn('gap-1.5 rounded-full border-transparent px-2.5 capitalize', style.badge)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {status}
    </Badge>
  )
}
