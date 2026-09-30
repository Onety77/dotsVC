import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

/** A quantity drawn in dots: `value / max` of the row is lit. Fills left to right when first seen. */
export function DotBar({ value, max, dots = 24, tone = 'ink', className }: { value: number; max: number; dots?: number; tone?: 'ink' | 'alive'; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const lit = Math.max(1, Math.round((value / (max || 1)) * dots))
  return (
    <span ref={ref} aria-hidden className={cn('inline-flex items-center gap-[3px]', className)}>
      {Array.from({ length: dots }, (_, i) => (
        <span
          key={i}
          className={cn('runway-dot size-[5px] shrink-0 rounded-full', (seen || reduced) && i < lit ? (tone === 'alive' ? 'bg-alive' : 'bg-ink') : 'bg-[var(--dot-dim)]')}
          style={{ transitionDelay: `${i * 18}ms` }}
        />
      ))}
    </span>
  )
}
