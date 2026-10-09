import { STATUSES, type Status } from '@/lib/types'

export interface AppRow {
  status: Status
  applied_on: string
}

export interface OpenTask {
  id: string
  title: string
  due_date: string | null
  application_id: string
  applications: { company: string; position: string } | null
}

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** Parses "YYYY-MM-DD" as a local date (avoids the UTC shift of new Date("YYYY-MM-DD")). */
const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7))

export function computeStats(apps: AppRow[], openTasks: OpenTask[], now = new Date()) {
  const today = toKey(now)
  const cutoff = toKey(addDays(now, -30))

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>
  for (const a of apps) byStatus[a.status]++

  const total = apps.length
  const active = byStatus.applied + byStatus.interviewing
  const progressed = byStatus.interviewing + byStatus.offer
  const last30 = apps.filter((a) => a.applied_on >= cutoff && a.applied_on <= today).length

  // Last 12 weeks, starting on Mondays, oldest first.
  const thisMonday = mondayOf(now)
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const start = addDays(thisMonday, (i - 11) * 7)
    return { key: toKey(start), label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: 0 }
  })
  for (const a of apps) {
    const key = toKey(mondayOf(fromKey(a.applied_on)))
    const week = weeks.find((w) => w.key === key)
    if (week) week.count++
  }

  const overdue = openTasks.filter((t) => t.due_date !== null && t.due_date < today)
  const upcoming = openTasks
    .filter((t) => t.due_date !== null)
    .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string))
    .slice(0, 5)

  return {
    total,
    active,
    progressRate: total ? progressed / total : null,
    offers: byStatus.offer,
    offerRate: total ? byStatus.offer / total : null,
    last30,
    openTasks: openTasks.length,
    overdue: overdue.length,
    byStatus,
    weeks,
    upcoming,
    today,
  }
}
