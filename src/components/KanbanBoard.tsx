import { useNavigate } from 'react-router-dom'

import { ApplicationCard } from '@/components/ApplicationCard'
import { groupByStatus } from '@/lib/board'
import { statusStyles } from '@/lib/status'
import { STATUSES, type Application } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function KanbanBoard({ applications }: { applications: Application[] }) {
  const navigate = useNavigate()
  const columns = groupByStatus(applications)

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {STATUSES.map((status) => (
        <section
          key={status}
          aria-label={`${status} applications`}
          className="flex min-h-48 w-72 shrink-0 snap-start flex-col gap-3 rounded-2xl bg-muted/60 p-3 lg:w-auto"
        >
          <header className="flex items-center gap-2 px-1">
            <span className={cn('size-2.5 rounded-full', statusStyles[status].dot)} />
            <h2 className="text-sm font-semibold capitalize">{status}</h2>
            <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {columns[status].length}
            </span>
          </header>
          <div className="flex flex-1 flex-col gap-3">
            {columns[status].map((app) => (
              <div
                key={app.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/applications/${app.id}`)}
                onKeyDown={(event) => event.key === 'Enter' && navigate(`/applications/${app.id}`)}
                className="cursor-pointer rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <ApplicationCard application={app} hideStatus className="hover:shadow-card-hover" />
              </div>
            ))}
            {columns[status].length === 0 && (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No applications
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
