import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { useCountUp } from '@/lib/useCountUp'
import { cn } from '@/lib/utils'

// Full class names so Tailwind can see them.
const tones = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
}

interface Props {
  label: string
  /** Null shows an em dash (nothing to compute yet). */
  value: number | null
  suffix?: string
  hint?: string
  icon: LucideIcon
  tone: keyof typeof tones
  /** Highlights the hint, e.g. for overdue tasks. */
  warn?: boolean
  /** Position in the grid, used to stagger the entrance animation. */
  index?: number
}

export function StatCard({ label, value, suffix = '', hint, icon: Icon, tone, warn, index = 0 }: Props) {
  const shown = useCountUp(value ?? 0)
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards duration-500"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tabular-nums">{value === null ? '—' : `${shown}${suffix}`}</p>
          {hint && <p className={cn('text-xs text-muted-foreground', warn && 'font-medium text-destructive')}>{hint}</p>}
        </div>
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}
