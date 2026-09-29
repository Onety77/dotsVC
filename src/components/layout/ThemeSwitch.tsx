import { m } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SPRING_UI } from '@/lib/motion'
import { useTheme } from '@/lib/theme'

/** Light / dark as a two-dot switch: the lit dot slides to the current theme, and the new theme spreads from here. */
export function ThemeSwitch({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setTheme(dark ? 'light' : 'dark', { x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light' : 'Switch to dark'}
      className={cn('relative flex h-9 w-[68px] items-center rounded-full border border-line-2 p-1 transition-colors hover-device:hover:bg-hover', className)}
    >
      <m.span aria-hidden className="absolute top-1 left-1 size-7 rounded-full bg-ink" initial={false} animate={{ x: dark ? 32 : 0 }} transition={SPRING_UI} />
      <span className={cn('relative grid size-7 place-items-center rounded-full transition-colors duration-300', !dark ? 'text-bg' : 'text-ink-3')}>
        <Sun className="size-3.5" />
      </span>
      <span className={cn('relative ml-auto grid size-7 place-items-center rounded-full transition-colors duration-300', dark ? 'text-bg' : 'text-ink-3')}>
        <Moon className="size-3.5" />
      </span>
    </button>
  )
}
