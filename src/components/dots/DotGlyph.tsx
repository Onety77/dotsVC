import { useMemo } from 'react'
import type { CompanyStatus } from '@/types'
import { cn } from '@/lib/cn'
import { seeded } from '@/lib/seeded'

/**
 * A company's emblem until real coin art is wired: a mirrored 5×5 dot matrix
 * generated from its ticker, so the same company always draws the same mark.
 * One dot carries its state: lime when alive, hollow when paused, red in receivership.
 * NORA: pass `src` (coin image from Pump metadata) to show the real art instead.
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
  const cells = useMemo(() => {
    const r = seeded(seed)
    const half = Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => r() > 0.42))
    const grid = half.map((row) => [row[0], row[1], row[2], row[1], row[0]])
    grid[2][2] = true // the centre dot always exists: it carries the state
    return grid
  }, [seed])

  const state =
    status === 'active' ? { fill: 'var(--lime)', stroke: 'none' } : status === 'distressed' ? { fill: 'var(--red)', stroke: 'none' } : { fill: 'none', stroke: 'var(--ink)' }

  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-[28%] border border-line bg-sunken', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" width={size} height={size} className="size-full object-cover" />
      ) : (
        <svg viewBox="0 0 50 50" className="size-[78%]" aria-hidden>
          {cells.flatMap((row, y) =>
            row.map((on, x) => {
              const centre = x === 2 && y === 2
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
                />
              )
            }),
          )}
        </svg>
      )}
    </span>
  )
}
