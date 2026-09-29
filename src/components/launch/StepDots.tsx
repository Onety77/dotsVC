import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Where you are in the launch, as dots on a line. Done steps can be revisited. */
export function StepDots({ steps, current, onSelect }: { steps: string[]; current: number; onSelect?: (i: number) => void }) {
  return (
    <ol className="flex items-center">
      {steps.map((s, i) => {
        const done = i < current
        const on = i === current
        return (
          <li key={s} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <button
              type="button"
              disabled={!done || !onSelect}
              onClick={() => onSelect?.(i)}
              aria-current={on ? 'step' : undefined}
              className="flex items-center gap-2.5 rounded-full disabled:cursor-default"
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full font-mono text-[12px]',
                  on && 'bg-lime text-on-lime',
                  done && 'bg-ink text-bg',
                  !on && !done && 'border border-line-2 text-ink-3',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('text-sm font-medium', on ? 'text-ink' : done ? 'text-ink-2' : 'text-ink-3', !on && 'max-md:sr-only')}>{s}</span>
            </button>
            {i < steps.length - 1 && <span className={cn('mx-3 h-px flex-1', done ? 'bg-ink' : 'bg-line-2')} />}
          </li>
        )
      })}
    </ol>
  )
}
