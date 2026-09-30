import { useId, useMemo, useRef, useState, type PointerEvent } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { pct, price } from '@/lib/format'
import { pricePath } from '@/lib/seeded'
import { EASE_OUT, SPRING_UI } from '@/lib/motion'

const ranges = [
  { id: '1D', points: 48, scale: 1 },
  { id: '1W', points: 56, scale: 2.2 },
  { id: '1M', points: 60, scale: 4.5 },
  { id: 'All', points: 72, scale: 9 },
] as const

const W = 800
const H = 280

/**
 * Price over time, with a readout that follows the pointer.
 * Motion: the line draws left to right when first seen and on every range change; a live dot
 * breathes at the latest price; the range pill slides.
 */
export function PriceChart({ company, className, bare }: { company: Company; className?: string; bare?: boolean }) {
  const [range, setRange] = useState<(typeof ranges)[number]['id']>('1D')
  const [hover, setHover] = useState<number | null>(null)
  const uid = useId()
  const box = useRef<HTMLDivElement>(null)
  const seen = useInView(box, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion()
  const r = ranges.find((x) => x.id === range)!
  const change = company.change24h * r.scale
  const data = useMemo(() => pricePath(`${company.id}-${range}`, company.priceUsd, change, r.points), [company, range, change, r.points])
  const min = Math.min(...data)
  const max = Math.max(...data)
  const x = (i: number) => (i / (data.length - 1)) * W
  const y = (v: number) => 16 + (1 - (v - min) / (max - min || 1)) * (H - 32)
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const up = change >= 0
  const shown = hover ?? data.length - 1

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1)))))
  }

  return (
    <div className={cn(!bare && 'rounded-card border border-line bg-surface', 'p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">${company.ticker} price</p>
          <p className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-[28px] font-medium tracking-[-0.03em] tabular">{price(data[shown])}</span>
            <span className={cn('font-mono text-sm', up ? 'text-lime-text' : 'text-red')}>{pct(change)}</span>
          </p>
        </div>
        <div role="radiogroup" aria-label="Range" className="flex rounded-full border border-line p-0.5">
          {ranges.map((x) => (
            <button
              key={x.id}
              role="radio"
              aria-checked={range === x.id}
              onClick={() => setRange(x.id)}
              className={cn('relative h-8 rounded-full px-3 font-mono text-[12px] transition-colors', range === x.id ? 'text-bg' : 'text-ink-3 hover-device:hover:text-ink')}
            >
              {range === x.id && <m.span layoutId={`range-${uid}`} className="absolute inset-0 rounded-full bg-ink" transition={SPRING_UI} />}
              <span className="relative">{x.id}</span>
            </button>
          ))}
        </div>
      </div>
      <div ref={box} className="relative mt-6">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-56 w-full touch-none sm:h-64"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${company.ticker} price chart, ${range}, ${pct(change)}`}
      >
        <defs>
          <linearGradient id={`fill-${company.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={up ? 'var(--alive)' : 'var(--red)'} stopOpacity="0.22" />
            <stop offset="1" stopColor={up ? 'var(--alive)' : 'var(--red)'} stopOpacity="0" />
          </linearGradient>
          {/* the wipe that draws the line */}
          <clipPath id={`wipe-${uid}`}>
            <m.rect key={range} x="0" y="0" height={H} initial={reduced ? false : { width: 0 }} animate={seen || reduced ? { width: W } : { width: 0 }} transition={{ duration: 1.3, ease: EASE_OUT }} width={W} />
          </clipPath>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line)" vectorEffect="non-scaling-stroke" />
        ))}
        <g clipPath={`url(#wipe-${uid})`}>
          <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#fill-${company.id})`} />
          <path d={line} fill="none" stroke={up ? 'var(--pulse)' : 'var(--red)'} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </g>
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--ink)" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {/* dots drawn in HTML so they stay round on the stretched chart */}
      {hover !== null && (
        <span aria-hidden className="pointer-events-none absolute size-2.5 -translate-1/2 rounded-full border-2 border-surface bg-ink" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover]) / H) * 100}%` }} />
      )}
      {hover === null && (
        <m.span
          key={range}
          aria-hidden
          className={cn('live-dot pointer-events-none absolute size-2 -translate-1/2 rounded-full', up ? 'bg-[var(--pulse)] text-[var(--pulse)]' : 'bg-red text-red')}
          style={{ left: '100%', top: `${(y(data[data.length - 1]) / H) * 100}%` }}
          initial={reduced ? false : { opacity: 0 }}
          animate={seen || reduced ? { opacity: 1 } : undefined}
          transition={{ duration: 0.3, delay: 1.1 }}
        />
      )}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-4">
        <span>{price(data[0])}</span>
        <span>{range === '1D' ? '24 hours' : range === '1W' ? '7 days' : range === '1M' ? '30 days' : 'Since launch'}</span>
        <span>{price(data[data.length - 1])} now</span>
      </div>
    </div>
  )
}
