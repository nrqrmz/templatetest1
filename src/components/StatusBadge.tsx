import { Badge } from '@/components/ui/badge'
import type { Status } from '@/lib/types'

const variants: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  applied: 'secondary',
  interviewing: 'outline',
  offer: 'default',
  rejected: 'destructive',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  )
}
