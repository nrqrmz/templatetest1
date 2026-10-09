import { useEffect, useState } from 'react'
import { Activity, Briefcase, ListChecks, Send, TrendingUp, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { StatusChart, WeeklyChart } from '@/components/dashboard/charts'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { computeStats, type AppRow, type OpenTask } from '@/lib/stats'
import { supabase } from '@/lib/supabase'
import { STATUSES } from '@/lib/types'
import { cn } from '@/lib/utils'

const percent = (value: number | null) => (value === null ? '—' : `${Math.round(value * 100)}%`)

export default function DashboardPage() {
  const [data, setData] = useState<{ apps: AppRow[]; tasks: OpenTask[] } | null>(null)

  useEffect(() => {
    async function load() {
      // RLS limits both queries to the signed-in user's rows.
      const [apps, tasks] = await Promise.all([
        supabase.from('applications').select('status, applied_on'),
        supabase.from('tasks').select('id, title, due_date, application_id, applications(company, position)').eq('done', false),
      ])
      const error = apps.error ?? tasks.error
      if (error) toast.error(error.message)
      setData({
        apps: (apps.data ?? []) as AppRow[],
        tasks: (tasks.data ?? []) as unknown as OpenTask[],
      })
    }
    load()
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const stats = computeStats(data.apps, data.tasks)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">How your job search is going.</p>
      </div>

      {stats.total === 0 ? (
        <p className="text-muted-foreground">
          No data yet. <Link to="/applications" className="underline">Add your first application</Link> to see your stats.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard index={0} icon={Briefcase} tone="indigo" label="Total applications" value={stats.total} />
            <StatCard index={1} icon={Activity} tone="sky" label="Active" value={stats.active} hint="Applied or interviewing" />
            <StatCard
              index={2}
              icon={TrendingUp}
              tone="violet"
              label="Progress rate"
              value={stats.progressRate === null ? null : Math.round(stats.progressRate * 100)}
              suffix="%"
              hint="Interviewing or offer, out of all applications"
            />
            <StatCard
              index={3}
              icon={Trophy}
              tone="emerald"
              label="Offers"
              value={stats.offers}
              hint={`${percent(stats.offerRate)} of all applications`}
            />
            <StatCard index={4} icon={Send} tone="fuchsia" label="Sent in the last 30 days" value={stats.last30} />
            <StatCard
              index={5}
              icon={ListChecks}
              tone={stats.overdue > 0 ? 'rose' : 'amber'}
              label="Open tasks"
              value={stats.openTasks}
              hint={stats.overdue > 0 ? `${stats.overdue} overdue` : 'None overdue'}
              warn={stats.overdue > 0}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StatusChart data={STATUSES.map((s) => ({ label: s[0].toUpperCase() + s.slice(1), count: stats.byStatus[s] }))} />
            <WeeklyChart data={stats.weeks.map((w) => ({ label: w.label, count: w.count }))} />
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming and overdue tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open tasks with a due date.</p>
          ) : (
            <ul className="divide-y">
              {stats.upcoming.map((task) => {
                const late = (task.due_date as string) < stats.today
                return (
                  <li key={task.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{task.title}</p>
                      <Link to={`/applications/${task.application_id}`} className="truncate text-xs text-muted-foreground underline">
                        {task.applications ? `${task.applications.position} at ${task.applications.company}` : 'Application'}
                      </Link>
                    </div>
                    <span className={cn('shrink-0 text-xs', late ? 'font-medium text-destructive' : 'text-muted-foreground')}>
                      {late ? 'Overdue · ' : 'Due '}
                      {task.due_date}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
