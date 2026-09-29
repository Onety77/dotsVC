import { Check } from 'lucide-react'
import { m } from 'motion/react'
import { EASE_OUT, SPRING_POP } from '@/lib/motion'
import { cn } from '@/lib/cn'

/** Where you are in the launch, as dots on a line. Done steps can be revisited. The line fills as you go; the current dot sends out a ring. */
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
                  'relative grid size-7 shrink-0 place-items-center rounded-full font-mono text-[12px] transition-colors duration-300',
                  on && 'bg-lime text-on-lime',
                  done && 'bg-ink text-bg',
                  !on && !done && 'border border-line-2 text-ink-3',
                )}
              >
                {on && <m.span key={`ring-${current}`} aria-hidden className="absolute inset-0 rounded-full border-2 border-lime" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ duration: 0.9, ease: EASE_OUT }} />}
                {done ? (
                  <m.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_POP}>
                    <Check className="size-3.5" strokeWidth={3} />
                  </m.span>
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn('text-sm font-medium', on ? 'text-ink' : done ? 'text-ink-2' : 'text-ink-3', !on && 'max-md:sr-only')}>{s}</span>
            </button>
            {i < steps.length - 1 && (
              <span className="relative mx-3 h-px flex-1 bg-line-2">
                <m.span className="absolute inset-0 origin-left bg-ink" initial={false} animate={{ scaleX: done ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
