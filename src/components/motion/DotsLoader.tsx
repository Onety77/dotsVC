import { m, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

// clockwise from top left
const P = [
  [7, 7],
  [17, 7],
  [17, 17],
  [7, 17],
] as const
const T = [0, 0.14, 0.25, 0.39, 0.5, 0.64, 0.75, 0.89, 1]
const path = (i: 0 | 1) => [P[0][i], P[0][i], P[1][i], P[1][i], P[2][i], P[2][i], P[3][i], P[3][i], P[0][i]]

/**
 * The loader is the logo at work: the live dot hops from corner to corner.
 * Under reduced motion it holds still in the logo position.
 */
export function DotsLoader({ className, label = 'Working', accent = 'var(--pulse)' }: { className?: string; label?: string; accent?: string }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4 shrink-0', className)} role="img" aria-label={label}>
      {P.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} fill="currentColor" opacity={0.22} />
      ))}
      {reduced ? (
        <circle cx={17} cy={17} r={3.6} fill={accent} />
      ) : (
        <m.circle r={3.6} fill={accent} initial={{ cx: 7, cy: 7 }} animate={{ cx: path(0), cy: path(1) }} transition={{ duration: 1.5, times: T, repeat: Infinity, ease: 'easeInOut' }} />
      )}
    </svg>
  )
}
