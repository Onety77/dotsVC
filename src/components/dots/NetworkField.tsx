import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { useMedia } from '@/lib/useMedia'
import { sol, usd } from '@/lib/format'
import { DotGlyph } from './DotGlyph'
import { RunwayDots } from './RunwayDots'
import { Status } from '@/components/ui/Status'

/** Two geometries: a wide map for desktop, a squarer one with bigger type for phones. */
const WIDE = { W: 1000, H: 660, SX: 1.45, font: 13, small: 12 }
const NARROW = { W: 640, H: 700, SX: 0.98, font: 20, small: 17 }
const RECEIVERSHIP = 290

interface Placed {
  c: Company
  x: number
  y: number
  r: number
  side: 1 | -1
}

/**
 * The Field: the whole network as dots around the holdco.
 * - Distance from the centre = runway (closer is safer).
 * - Size = treasury.
 * - Lime = active, hollow = paused, red = in receivership, out on the outer ring
 *   with its line to the holdco cut.
 * Hover (or tap) a dot to see the company; click opens it.
 */
export function NetworkField({ companies, className, compact }: { companies: Company[]; className?: string; compact?: boolean }) {
  const navigate = useNavigate()
  const [active, setActive] = useState<string | null>(null)
  const wide = useMedia('(min-width: 640px)')
  const { W, H, SX, font, small } = wide ? WIDE : NARROW
  const CX = W / 2
  const CY = H / 2

  const placed = useMemo<Placed[]>(() => {
    const live = companies.filter((c) => c.status !== 'distressed').sort((a, b) => b.treasurySol - a.treasurySol)
    const out = companies.filter((c) => c.status === 'distressed')
    const maxRunway = Math.max(...live.map((c) => c.runwayDays), 1)
    const place = (c: Company, angle: number, ring: number): Placed => {
      const x = CX + Math.cos(angle) * ring * SX
      const y = CY + Math.sin(angle) * ring
      const r = 5 + Math.sqrt(c.treasurySol) * 0.55
      // labels point outward, unless that would run off the edge of the map
      const labelW = (c.ticker.length + 1) * font * 0.62 + r + 10
      let side: 1 | -1 = Math.cos(angle) >= 0 ? 1 : -1
      if (side === 1 && x + labelW > W) side = -1
      if (side === -1 && x - labelW < 0) side = 1
      return { c, x, y, r, side }
    }
    return [
      // spread the living companies around the circle; runway sets the distance
      ...live.map((c, i) => place(c, -Math.PI / 2 + (i + 0.5) * ((2 * Math.PI) / live.length), 108 + (1 - c.runwayDays / maxRunway) * 140)),
      // the distressed sit on the receivership ring, offset so they fall between the others
      ...out.map((c, i) => place(c, -Math.PI / 2 + (i + 0.25) * ((2 * Math.PI) / out.length) + 0.35, RECEIVERSHIP)),
    ]
  }, [companies, CX, CY, SX, W, font])

  const shown = placed.find((p) => p.c.id === active)

  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Network map of ${companies.length} companies`}>
        {/* Rings: runway guides and the receivership boundary */}
        {[150, 220].map((r) => (
          <ellipse key={r} cx={CX} cy={CY} rx={r * SX} ry={r} fill="none" stroke="var(--line)" strokeWidth={1} />
        ))}
        <ellipse cx={CX} cy={CY} rx={RECEIVERSHIP * SX} ry={RECEIVERSHIP} fill="none" stroke="var(--red)" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="2 6" strokeLinecap="round" />
        {!compact && (
          <text x={CX} y={CY - RECEIVERSHIP - 10} textAnchor="middle" className="fill-red font-mono tracking-[0.08em]" fontSize={small} opacity={0.85}>
            RECEIVERSHIP
          </text>
        )}

        {/* Ownership lines: every company still in the network is tied to the holdco */}
        {placed.map((p) =>
          p.c.status === 'distressed' ? null : (
            <line key={`l-${p.c.id}`} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="var(--ink)" strokeOpacity={active === p.c.id ? 0.5 : 0.12} strokeWidth={1} />
          ),
        )}

        {/* The holdco */}
        <circle cx={CX} cy={CY} r={40} fill="none" stroke="var(--line-2)" />
        <circle cx={CX} cy={CY} r={26} fill="var(--ink)" />
        <g transform={`translate(${CX - 9}, ${CY - 9})`}>
          <circle cx="4" cy="4" r="2.6" fill="var(--bg)" />
          <circle cx="14" cy="4" r="2.6" fill="var(--bg)" />
          <circle cx="4" cy="14" r="2.6" fill="var(--bg)" />
          <circle cx="14" cy="14" r="2.6" fill="var(--lime)" />
        </g>
        <text x={CX} y={CY + 62} textAnchor="middle" className="fill-ink font-mono tracking-[0.08em]" fontSize={small}>
          DOTS HOLDCO
        </text>

        {/* Companies */}
        {placed.map((p) => {
          const on = active === p.c.id
          const dim = active !== null && !on
          const fill = p.c.status === 'active' ? 'var(--lime)' : p.c.status === 'distressed' ? 'var(--red)' : 'var(--bg)'
          return (
            <g
              key={p.c.id}
              className="cursor-pointer"
              opacity={dim ? 0.35 : 1}
              onMouseEnter={() => setActive(p.c.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.c.id)}
              onBlur={() => setActive(null)}
              onClick={() => navigate(`/company/${p.c.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/company/${p.c.id}`)}
              tabIndex={0}
              role="link"
              aria-label={`${p.c.name}, ${p.c.runwayDays} days of runway`}
            >
              {/* generous invisible hit area */}
              <circle cx={p.x} cy={p.y} r={Math.max(p.r + 10, 20)} fill="transparent" />
              {on && <circle cx={p.x} cy={p.y} r={p.r + 7} fill="none" stroke="var(--ink)" strokeOpacity={0.35} />}
              <circle cx={p.x} cy={p.y} r={p.r} fill={fill} stroke={p.c.status === 'paused' ? 'var(--ink)' : 'var(--bg)'} strokeWidth={p.c.status === 'paused' ? 1.8 : 2} />
              <text
                x={p.x + (p.r + 8) * p.side}
                y={p.y + font * 0.32}
                textAnchor={p.side === 1 ? 'start' : 'end'}
                className={cn('font-mono', p.c.status === 'distressed' ? 'fill-red' : 'fill-ink')}
                fontSize={font}
                opacity={on || !compact ? 1 : 0.8}
              >
                ${p.c.ticker}
              </text>
            </g>
          )
        })}
      </svg>

      {/* The company under the pointer */}
      {shown && (
        <div
          className="pointer-events-none absolute z-10 hidden w-64 rounded-card border border-line bg-surface p-4 shadow-card sm:block"
          style={{
            left: `${(shown.x / W) * 100}%`,
            top: `${(shown.y / H) * 100}%`,
            transform: `translate(${shown.side === 1 ? 'calc(-100% - 24px)' : '24px'}, -50%)`,
          }}
        >
          <div className="flex items-center gap-3">
            <DotGlyph seed={shown.c.ticker} status={shown.c.status} size={36} src={shown.c.image} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{shown.c.name}</p>
              <p className="font-mono text-[12px] text-ink-3">${shown.c.ticker}</p>
            </div>
          </div>
          <Status status={shown.c.status} className="mt-3" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <RunwayDots days={shown.c.runwayDays} size="sm" />
            <span className="font-mono text-[12px] text-ink-2">{shown.c.runwayDays}d</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-[12px]">
            <div>
              <dt className="text-ink-3">Treasury</dt>
              <dd className="font-mono">{sol(shown.c.treasurySol)}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Fees (30d)</dt>
              <dd className="font-mono">{usd(shown.c.fees30dUsd)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}

/** How to read the Field. */
export function FieldLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-3', className)}>
      <li className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-lime" /> Active
      </li>
      <li className="flex items-center gap-2">
        <span className="size-2.5 rounded-full border-[1.5px] border-ink" /> Paused
      </li>
      <li className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-red" /> In receivership
      </li>
      <li className="basis-full">Closer to the centre = longer runway. Size = treasury.</li>
      <li className="hidden sm:block">
        <Link to="/network" className="inline-flex items-center gap-1 font-medium text-ink-2 hover-device:hover:text-ink">
          Open the network <ArrowUpRight className="size-3.5" />
        </Link>
      </li>
    </ul>
  )
}
