import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getTheme, setTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setCurrent] = useState<Theme>(getTheme)

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setCurrent(next)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
