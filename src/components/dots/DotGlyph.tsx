import { useMemo, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import type { CompanyStatus } from '@/types'
import { cn } from '@/lib/cn'
import { seeded } from '@/lib/seeded'

/**
 * A company's emblem until real coin art is wired: a mirrored 5×5 dot matrix
 * generated from its ticker, so the same company always draws the same mark.
 * One dot carries its state: lime when alive, hollow when paused, red in receivership.
 *
 * Motion: the first time it's seen, the dots pop in from the centre outward. When the seed
 * changes (typing a ticker in the launch flow) the mark re-forms in a ripple from the centre.
 * When the status changes (a rescue), the centre dot changes colour and sends out a ring.
 */
export function DotGlyph({
  seed,
  status = 'active',
  size = 40,
  src,
  className,
}: {
  seed: string
  status?: CompanyStatus
  size?: number
  src?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -4% 0px' })
  const cells = useMemo(() => {
    const r = seeded(seed)
    const half = Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => r() > 0.42))
    const grid = half.map((row) => [row[0], row[1], row[2], row[1], row[0]])
    grid[2][2] = true // the centre dot always exists: it carries the state
    return grid
  }, [seed])

  // a ring leaves the centre each time the status changes (not on first render)
  const [prev, setPrev] = useState(status)
  const [ring, setRing] = useState(0)
  if (status !== prev) {
    setPrev(status)
    setRing((n) => n + 1)
  }

  const state =
    status === 'active' ? { fill: 'var(--lime)', stroke: 'none' } : status === 'distressed' ? { fill: 'var(--red)', stroke: 'none' } : { fill: 'var(--sunken)', stroke: 'var(--ink)' }

  return (
    <span
      ref={ref}
      className={cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-[28%] border border-line bg-sunken', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" width={size} height={size} className="size-full object-cover" />
      ) : (
        <svg viewBox="0 0 50 50" className="glyph size-[78%] overflow-visible" data-seen={seen} aria-hidden>
          {cells.flatMap((row, y) =>
            row.map((on, x) => {
              const centre = x === 2 && y === 2
              const dist = Math.hypot(x - 2, y - 2)
              return (
                <circle
                  key={`${x}-${y}`}
                  cx={5 + x * 10}
                  cy={5 + y * 10}
                  r={centre ? 4.2 : 3.4}
                  fill={centre ? state.fill : on ? 'var(--ink)' : 'var(--dot-dim)'}
                  stroke={centre ? state.stroke : 'none'}
                  strokeWidth={centre ? 1.6 : 0}
                  opacity={!centre && !on ? 0.9 : 1}
                  style={{ transitionDelay: `${Math.round(dist * 55)}ms` }}
                />
              )
            }),
          )}
          {ring > 0 && <circle key={ring} className="glyph-ripple" cx={25} cy={25} r={6} fill="none" stroke={state.fill === 'var(--sunken)' ? 'var(--ink)' : state.fill} strokeWidth={2} />}
        </svg>
      )}
    </span>
  )
}
