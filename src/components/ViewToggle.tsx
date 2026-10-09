import { LayoutGrid, Columns3 } from 'lucide-react'

import { cn } from '@/lib/utils'

export type View = 'board' | 'grid'

const options: { value: View; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'board', label: 'Board', icon: Columns3 },
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
]

export function ViewToggle({ value, onChange }: { value: View; onChange: (view: View) => void }) {
  return (
    <div role="group" aria-label="Choose a view" className="inline-flex rounded-full border bg-card p-1 shadow-xs">
      {options.map(({ value: option, label, icon: Icon }) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            value === option
              ? 'bg-secondary text-secondary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
