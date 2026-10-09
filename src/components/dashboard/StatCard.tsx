import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  hint?: string
  /** Highlights the hint, e.g. for overdue tasks. */
  warn?: boolean
}

export function StatCard({ label, value, hint, warn }: Props) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
        {hint && <p className={cn('text-xs text-muted-foreground', warn && 'font-medium text-destructive')}>{hint}</p>}
      </CardContent>
    </Card>
  )
}
