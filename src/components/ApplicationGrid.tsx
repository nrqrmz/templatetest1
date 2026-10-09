import { Link } from 'react-router-dom'

import { ApplicationCard } from '@/components/ApplicationCard'
import type { Application } from '@/lib/types'

export function ApplicationGrid({ applications }: { applications: Application[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map((app, index) => (
        <Link
          key={app.id}
          to={`/applications/${app.id}`}
          className="group animate-in fade-in slide-in-from-bottom-2 rounded-2xl fill-mode-backwards duration-500 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
        >
          <ApplicationCard
            application={app}
            className="group-hover:-translate-y-0.5 group-hover:shadow-card-hover"
          />
        </Link>
      ))}
    </div>
  )
}
