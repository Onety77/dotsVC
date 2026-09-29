import { useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { critical } from '@/lib/format'

/**
 * Runway you can count: one dot per week the treasury lasts at today's burn.
 * Filled dots are weeks left; the rest of the row is the scale. Under three weeks it turns red.
 *
 * Motion: the weeks fill in left to right the first time the row is seen. When the runway
 * changes (the launch preview), the change ripples outward from where it happened.
 * On a critical company the last week left beats like a heart.
 */
export function RunwayDots({
  days,
  weeks = 14,
  size = 'md',
  className,
}: {
  days: number
  weeks?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -6% 0px' })
  const reduced = useReducedMotion()
  const on = seen || reduced
  const left = Math.min(weeks, Math.ceil(days / 7))
  const red = critical(days)

  // where the last change started, so the fill flows from that point
  const [prev, setPrev] = useState(left)
  const [from, setFrom] = useState(0)
  if (left !== prev) {
    setFrom(prev)
    setPrev(left)
  }

  const d = size === 'lg' ? 'size-2.5' : size === 'md' ? 'size-[7px]' : 'size-[5px]'
  const gap = size === 'lg' ? 'gap-1.5' : size === 'md' ? 'gap-1' : 'gap-[3px]'
  return (
    <span ref={ref} role="img" aria-label={`${days} days of runway`} className={cn('inline-flex items-center', gap, className)}>
      {Array.from({ length: weeks }, (_, i) => {
        const lit = on && i < left
        return (
          <span
            key={i}
            className={cn('runway-dot shrink-0 rounded-full', d, lit ? (red ? 'bg-red' : 'bg-ink') : 'bg-[var(--dot-dim)]', lit && red && i === left - 1 && 'heartbeat')}
            style={{ transitionDelay: `${Math.abs(i - from) * 32}ms` }}
          />
        )
      })}
    </span>
  )
}
