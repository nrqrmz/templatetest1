import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const gradients = [
  'from-indigo-500 to-violet-500',
  'from-violet-500 to-fuchsia-500',
  'from-fuchsia-500 to-pink-500',
  'from-sky-500 to-indigo-500',
  'from-teal-500 to-sky-500',
]

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)).toUpperCase()
}

/** Round badge with the company's initials. The color is picked from the name, so it is stable. */
export function CompanyAvatar({ name, className }: { name: string; className?: string }) {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return (
    <Avatar className={cn('size-11', className)}>
      <AvatarFallback
        className={cn('bg-gradient-to-br font-semibold text-white', gradients[hash % gradients.length])}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
