import { cn } from '@/lib/cn'

/** A row of pill options; the selected one is filled. */
export function Segmented<T extends string>({ options, value, onChange, label, className }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string; className?: string }) {
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
            className={cn(
              'flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
              on ? 'border-ink bg-ink text-bg' : 'border-line-2 text-ink-2 hover-device:hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn('font-mono text-[12px]', on ? 'text-bg/60' : 'text-ink-4')}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
