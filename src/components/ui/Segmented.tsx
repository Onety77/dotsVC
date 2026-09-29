import { useId } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { SPRING_UI } from '@/lib/motion'
import { Rolling } from '@/components/motion/Rolling'

/** A row of pill options; the filled pill slides to the one you pick. */
export function Segmented<T extends string>({ options, value, onChange, label, className }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string; className?: string }) {
  const id = useId()
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex max-w-full gap-1 overflow-x-auto [scrollbar-width:none]', className)}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn('relative flex h-9 shrink-0 items-center gap-2 rounded-full border border-line-2 px-4 text-sm font-medium transition-colors duration-200', on ? 'text-bg' : 'text-ink-2 hover-device:hover:text-ink')}
          >
            {on && <m.span layoutId={`seg-${id}`} className="absolute -inset-px rounded-full bg-ink" transition={SPRING_UI} />}
            <span className="relative">{o.label}</span>
            {o.count !== undefined && <Rolling value={o.count} text={String(o.count)} className={cn('relative font-mono text-[12px] transition-colors duration-200', on ? 'text-bg/60' : 'text-ink-4')} />}
          </button>
        )
      })}
    </div>
  )
}
