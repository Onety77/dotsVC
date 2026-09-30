import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { day } from '@/lib/format'
import { EASE_OUT, SPRING_POP } from '@/lib/motion'

/**
 * The company's life as a thread of dots, newest first. On first view the thread draws down
 * and each event's dot lands in turn; the latest one is alive (lime) or in trouble (red).
 */
export function History({ company: c, className }: { company: Company; className?: string }) {
  const ref = useRef<HTMLOListElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion()
  const go = seen || reduced
  const events = [...c.timeline].reverse()
  return (
    <ol ref={ref} className={cn('mt-4 rounded-card border border-line bg-surface p-5', className)}>
      {events.map((e, i) => {
        const latest = i === 0
        return (
          <li key={e.at + e.text} className="relative grid grid-cols-[18px_64px_1fr] gap-3 pb-4 last:pb-0">
            {i < events.length - 1 && (
              <m.span
                aria-hidden
                className="absolute top-3 bottom-0 left-[4px] w-px origin-top bg-line-2"
                initial={reduced ? false : { scaleY: 0 }}
                animate={go ? { scaleY: 1 } : undefined}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.12, ease: 'linear' }}
              />
            )}
            <m.span
              className={cn('mt-1.5 size-2.5 rounded-full', latest ? (c.status === 'distressed' ? 'bg-red text-red' : 'bg-alive text-alive') : 'bg-ink-4', latest && c.status !== 'paused' && 'live-dot')}
              initial={reduced ? false : { scale: 0 }}
              animate={go ? { scale: 1 } : undefined}
              transition={{ ...SPRING_POP, delay: i * 0.12 }}
            />
            <m.span className="font-mono text-[12px] text-ink-3" initial={reduced ? false : { opacity: 0, x: -4 }} animate={go ? { opacity: 1, x: 0 } : undefined} transition={{ duration: 0.4, delay: i * 0.12 + 0.05, ease: EASE_OUT }}>
              {day(e.at)}
            </m.span>
            <m.span className="text-[15px]" initial={reduced ? false : { opacity: 0, x: -4 }} animate={go ? { opacity: 1, x: 0 } : undefined} transition={{ duration: 0.4, delay: i * 0.12 + 0.08, ease: EASE_OUT }}>
              {e.text}
            </m.span>
          </li>
        )
      })}
    </ol>
  )
}
