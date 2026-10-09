import type { Status } from '@/lib/types'

// Full class names (no string building) so Tailwind can see them.
// Every status always appears with its text label as well, never color alone.
export const statusStyles: Record<Status, { badge: string; dot: string; bar: string }> = {
  applied: {
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    dot: 'bg-sky-500',
    bar: 'from-sky-400 to-sky-600',
  },
  interviewing: {
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
    bar: 'from-amber-400 to-orange-500',
  },
  offer: {
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    bar: 'from-emerald-400 to-emerald-600',
  },
  rejected: {
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
    bar: 'from-rose-400 to-rose-600',
  },
}
