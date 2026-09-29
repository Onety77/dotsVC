import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useTheme } from '@/lib/theme'

/** Light / dark. Designed as a two-dot switch; the lit dot is the current theme. */
export function ThemeSwitch({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light' : 'Switch to dark'}
      className={cn('relative flex h-9 w-[68px] items-center rounded-full border border-line-2 p-1 transition-colors hover-device:hover:bg-hover', className)}
    >
      <span className={cn('grid size-7 place-items-center rounded-full transition-colors', !dark ? 'bg-ink text-bg' : 'text-ink-3')}>
        <Sun className="size-3.5" />
      </span>
      <span className={cn('ml-auto grid size-7 place-items-center rounded-full transition-colors', dark ? 'bg-ink text-bg' : 'text-ink-3')}>
        <Moon className="size-3.5" />
      </span>
    </button>
  )
}
