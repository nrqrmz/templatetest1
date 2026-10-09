import { STATUSES, type Application, type Status } from '@/lib/types'

export type Columns = Record<Status, Application[]>

const STEP = 1000
/** If two neighbours are closer than this, a midpoint is no longer reliable and the column is renumbered. */
const MIN_GAP = 1e-6

/** Splits applications into one list per status, each ordered top to bottom by `sort_order`. */
export function groupByStatus(applications: Application[]): Columns {
  const columns = Object.fromEntries(STATUSES.map((s) => [s, [] as Application[]])) as Columns
  for (const app of applications) columns[app.status].push(app)
  for (const status of STATUSES) {
    columns[status].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
  }
  return columns
}

export interface SortUpdate {
  id: string
  sort_order: number
}

/** A change to save: the new order and, for the dragged card only, its new status. */
export interface Move extends SortUpdate {
  status?: Status
}

/**
 * Works out what to save after the card `id` was dropped into `column` (the column as it looks now,
 * with the card already in its new place). Normally that is a single row: the card gets the midpoint
 * between its two neighbours. Only when the neighbours are too close is the whole column renumbered.
 */
export function planMove(column: Application[], id: string): SortUpdate[] {
  const index = column.findIndex((a) => a.id === id)
  if (index === -1) return []
  const prev = column[index - 1]?.sort_order
  const next = column[index + 1]?.sort_order

  let value: number
  if (prev === undefined && next === undefined) value = STEP
  else if (prev === undefined) value = (next as number) - STEP
  else if (next === undefined) value = prev + STEP
  else value = (prev + next) / 2

  const crowded = prev !== undefined && next !== undefined && (next - prev < MIN_GAP * 2 || value <= prev || value >= next)
  if (crowded) return column.map((a, i) => ({ id: a.id, sort_order: (i + 1) * STEP }))
  return [{ id, sort_order: value }]
}
