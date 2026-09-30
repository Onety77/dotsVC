import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { useMedia } from '@/lib/useMedia'
import { sol, usd } from '@/lib/format'
import { seeded } from '@/lib/seeded'
import { addToHoldco } from '@/lib/live'
import { EASE_IN_OUT, EASE_OUT, EASE_PULL, SPRING_POP, svgOrigin } from '@/lib/motion'
import { DotGlyph } from './DotGlyph'
import { RunwayDots } from './RunwayDots'
import { Status } from '@/components/ui/Status'

/** Two geometries: a wide map for desktop, a squarer one with bigger type for phones. */
/** SX / SY stretch the rings into ovals so the whole map fits the first screen. */
const WIDE = { W: 1000, H: 540, SX: 1.45, SY: 0.8, font: 13, small: 12, pulse: 3.2 }
const NARROW = { W: 640, H: 580, SX: 0.98, SY: 0.86, font: 20, small: 17, pulse: 5 }
const RECEIVERSHIP = 290
/** where a failing company sat just before it was cut loose */
const FORMER = 214

/** The intro, in seconds from the moment the map is first seen. */
const T = {
  rings: 0.05,
  holdco: 0.15,
  lines: 0.45,
  dots: 0.7,
  live: 1.9, // fee pulses start
  fall: 2.4, // runway hits zero: failing companies turn red…
  drift: 0.4, // …then drift out to the receivership ring
  fallStep: 0.3,
  fallFor: 1.5,
}

/** The angle halfway between two living companies, spreading `n` failures evenly over the free gaps. */
function gapAngle(i: number, n: number, living: number) {
  const step = (2 * Math.PI) / Math.max(living, 1)
  const mid = (g: number) => -Math.PI / 2 + (g + 1) * step
  const clearOfLabel = (a: number) => Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) > 0.35
  const free = Array.from({ length: Math.max(living, 1) }, (_, g) => g).filter((g) => clearOfLabel(mid(g)))
  if (free.length < n) return -Math.PI / 2 + (i + 0.25) * ((2 * Math.PI) / n) + 0.35
  return mid(free[Math.floor(((i + 0.5) * free.length) / n)])
}

interface Placed {
  c: Company
  x: number
  y: number
  r: number
  /** which way the tooltip opens: toward the centre */
  side: 1 | -1
  label: { x: number; y: number; anchor: 'start' | 'end' | 'middle' }
  ring: number
  /** index within its group (living, or in receivership) */
  k: number
  /** 0–1, fixed per company: breathing rhythm */
  phase: number
  from?: { x: number; y: number }
}

interface Pulse {
  id: number
  p: Placed
  dur: number
  sol: number
}

/**
 * The Field: the whole network as dots around the holdco.
 * - Distance from the centre = runway (closer is safer). Size = treasury.
 * - Lime = active, hollow = paused, red = in receivership, out on the outer ring with its line cut.
 *
 * It also moves, and every movement is the mechanism:
 * - On first view the network assembles, strongest companies first. Then the ones whose runway
 *   hit zero turn red, drift out to the receivership ring, and their line to the holdco snaps.
 * - Living companies breathe; paused ones hold still; cut-off ones fade.
 * - Creator fees flow: lime pulses travel from earning companies into the holdco (weighted by
 *   fees), and the holdco ripples and its treasury ticks up (`useHoldcoTreasury`). Hover a company
 *   to see its own fees flow.
 * Under reduced motion it renders the end state, still.
 */
export function NetworkField(props: FieldProps) {
  // Replay re-mounts the map, so the whole intro plays again from the first frame
  const [take, setTake] = useState(0)
  return <Field key={take} {...props} onReplay={() => setTake((t) => t + 1)} />
}

interface FieldProps {
  companies: Company[]
  className?: string
  delay?: number
  highlight?: string
}

function Field({ companies, className, delay = 0, highlight, onReplay }: FieldProps & { onReplay: () => void }) {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.3 })
  const onScreen = useInView(ref)
  const reduced = useReducedMotion() ?? false
  const go = seen || reduced
  const init = <V,>(v: V) => (reduced ? false : v)

  const [active, setActive] = useState<string | null>(null)
  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  })

  const wide = useMedia('(min-width: 640px)')
  const { W, H, SX, SY, font, small, pulse: pulseR } = wide ? WIDE : NARROW
  const CX = W / 2
  const CY = H / 2

  const placed = useMemo<Placed[]>(() => {
    const live = companies.filter((c) => c.status !== 'distressed').sort((a, b) => b.treasurySol - a.treasurySol)
    const out = companies.filter((c) => c.status === 'distressed')
    const maxRunway = Math.max(...live.map((c) => c.runwayDays), 1)
    const at = (angle: number, ring: number) => ({ x: CX + Math.cos(angle) * ring * SX, y: CY + Math.sin(angle) * ring * SY })
    const place = (c: Company, k: number, angle: number, ring: number, from?: number): Placed => {
      const { x, y } = at(angle, ring)
      const r = 5 + Math.sqrt(c.treasurySol) * 0.55
      return { c, x, y, r, side: x >= CX ? 1 : -1, label: { x, y, anchor: 'start' }, ring, k, phase: seeded(c.id)(), from: from ? at(angle, from) : undefined }
    }
    const all = [
      // spread the living companies around the circle; runway sets the distance
      ...live.map((c, i) => place(c, i, -Math.PI / 2 + (i + 0.5) * ((2 * Math.PI) / live.length), 108 + (1 - c.runwayDays / maxRunway) * 140)),
      // the distressed sit in the gaps between living companies (never under the ring's label at
      // the top), so neither their fall nor their resting place crowds anyone
      ...out.map((c, i) => place(c, i, gapAngle(i, out.length, live.length), RECEIVERSHIP, FORMER)),
    ]

    // Labels: try outside, then inside, then above, then below, and take the first spot that
    // stays on the map and clears every other label, every dot and the holdco.
    type Box = { x0: number; x1: number; y0: number; y1: number; own?: Placed }
    const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
    const taken: Box[] = [
      { x0: CX - 46, x1: CX + 46, y0: CY - 46, y1: CY + 46 },
      { x0: CX - small * 4.4, x1: CX + small * 4.4, y0: CY + 62 - small, y1: CY + 66 },
      { x0: CX - small * 4.6, x1: CX + small * 4.6, y0: CY - RECEIVERSHIP * SY - 10 - small, y1: CY - RECEIVERSHIP * SY - 6 },
      ...all.map((p) => ({ x0: p.x - p.r - 3, x1: p.x + p.r + 3, y0: p.y - p.r - 3, y1: p.y + p.r + 3, own: p })),
    ]
    for (const p of all) {
      const tw = (p.c.ticker.length + 1) * font * 0.62
      const outward: 1 | -1 = p.x >= CX ? 1 : -1
      const beside = (s: 1 | -1) => {
        const x = p.x + (p.r + 8) * s
        return { box: { x0: s === 1 ? x : x - tw, x1: s === 1 ? x + tw : x, y0: p.y - font * 0.62, y1: p.y + font * 0.45 }, label: { x, y: p.y + font * 0.32, anchor: s === 1 ? ('start' as const) : ('end' as const) } }
      }
      const stacked = (s: 1 | -1) => {
        const y = s === -1 ? p.y - p.r - 7 : p.y + p.r + font * 0.95
        return { box: { x0: p.x - tw / 2, x1: p.x + tw / 2, y0: y - font * 0.8, y1: y + 2 }, label: { x: p.x, y, anchor: 'middle' as const } }
      }
      const options = [beside(outward), beside(-outward as 1 | -1), stacked(-1), stacked(1)]
      const fits = (b: Box) => b.x0 >= 2 && b.x1 <= W - 2 && b.y0 >= 2 && b.y1 <= H - 2 && !taken.some((t) => t.own !== p && hit(b, t))
      const pick = options.find((o) => fits(o.box)) ?? options.find((o) => o.box.x0 >= 2 && o.box.x1 <= W - 2) ?? options[0]
      p.label = pick.label
      taken.push(pick.box)
    }
    return all
  }, [companies, CX, CY, SX, SY, W, H, font, small])
  const failing = placed.filter((p) => p.c.status === 'distressed')

  // ── the intro timeline ──
  const [live, setLive] = useState(reduced)
  const [fallen, setFallen] = useState(reduced)
  const [cut, setCut] = useState(reduced ? Infinity : 0) // how many lines have snapped
  const nFailing = failing.length
  useEffect(() => {
    if (!seen || reduced) return
    const ids: number[] = []
    const at = (s: number, f: () => void) => ids.push(window.setTimeout(f, (delay + s) * 1000))
    at(T.live, () => setLive(true))
    at(T.fall, () => setFallen(true))
    for (let k = 0; k < nFailing; k++) at(T.fall + k * T.fallStep + T.drift + T.fallFor, () => setCut(k + 1))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [seen, reduced, delay, nFailing])

  // ── creator fees flowing into the holdco ──
  const [pulses, setPulses] = useState<Pulse[]>([])
  const [ripples, setRipples] = useState<number[]>([])
  const [kick, setKick] = useState(0)
  const seq = useRef(0)
  const running = live && onScreen && !reduced
  useEffect(() => {
    if (!running) return
    const pool = placed.filter((p) => p.c.status === 'active')
    if (!pool.length) return
    const total = pool.reduce((a, p) => a + p.c.fees30dUsd, 0)
    const pick = () => {
      const hovered = pool.find((p) => p.c.id === activeRef.current)
      if (hovered && Math.random() < 0.6) return hovered
      let n = Math.random() * total
      for (const p of pool) if ((n -= p.c.fees30dUsd) <= 0) return p
      return pool[0]
    }
    const id = window.setInterval(() => {
      if (document.hidden) return
      const p = pick()
      seq.current += 1
      const dur = 0.75 + Math.hypot(p.x - CX, p.y - CY) / 480
      const share = 0.004 + Math.random() * 0.018 * (p.c.fees30dUsd / 200_000)
      setPulses((ps) => [...ps.slice(-10), { id: seq.current, p, dur, sol: share }])
    }, 900)
    return () => window.clearInterval(id)
  }, [running, placed, CX, CY])

  const arrive = (u: Pulse) => {
    setPulses((ps) => ps.filter((x) => x.id !== u.id))
    setRipples((rs) => [...rs.slice(-3), u.id])
    setKick((k) => k + 1)
    addToHoldco(u.sol)
  }

  const shown = placed.find((p) => p.c.id === active)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Network map of ${companies.length} companies`}>
        {/* Rings: runway guides and the receivership boundary */}
        {[150, 220].map((r, i) => (
          <m.ellipse
            key={r}
            cx={CX}
            cy={CY}
            rx={r * SX}
            ry={r * SY}
            fill="none"
            stroke="var(--line)"
            strokeWidth={1}
            initial={init({ pathLength: 0 })}
            animate={go ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.6, delay: delay + T.rings + i * 0.15, ease: EASE_OUT }}
          />
        ))}
        <m.g initial={init({ opacity: 0 })} animate={go ? { opacity: 1 } : undefined} transition={{ duration: 1, delay: delay + T.lines }}>
          <ellipse cx={CX} cy={CY} rx={RECEIVERSHIP * SX} ry={RECEIVERSHIP * SY} fill="none" stroke="var(--red)" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="2 6" strokeLinecap="round" />
          <text x={CX} y={CY - RECEIVERSHIP * SY - 10} textAnchor="middle" className="fill-red font-mono tracking-[0.08em]" fontSize={small} opacity={0.85}>
            RECEIVERSHIP
          </text>
        </m.g>

        {/* Ownership lines: every company still in the network is tied to the holdco */}
        {placed.map((p) =>
          p.c.status === 'distressed' ? null : (
            <m.line
              key={`l-${p.c.id}`}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke="var(--ink)"
              strokeWidth={1}
              initial={init({ pathLength: 0, strokeOpacity: 0.12 })}
              animate={go ? { pathLength: 1, strokeOpacity: active === p.c.id ? 0.5 : 0.12 } : undefined}
              transition={{ pathLength: { duration: 0.7, delay: delay + T.lines + p.k * 0.05 + (p.c.id === highlight ? 1 : 0), ease: EASE_OUT }, strokeOpacity: { duration: 0.2 } }}
            />
          ),
        )}
        {/* …and the failing ones are still tied, until their runway runs out */}
        {failing.map((p) =>
          p.k < cut || !p.from ? null : (
            <m.line
              key={`d-${p.c.id}`}
              x1={CX}
              y1={CY}
              stroke="var(--ink)"
              strokeOpacity={0.12}
              strokeWidth={1}
              initial={{ pathLength: 0, x2: p.from.x, y2: p.from.y }}
              animate={go ? { pathLength: 1, x2: fallen ? p.x : p.from.x, y2: fallen ? p.y : p.from.y } : undefined}
              transition={{
                pathLength: { duration: 0.7, delay: delay + T.lines + 0.3 + p.k * 0.05, ease: EASE_OUT },
                x2: { duration: T.fallFor, delay: p.k * T.fallStep + T.drift, ease: EASE_IN_OUT },
                y2: { duration: T.fallFor, delay: p.k * T.fallStep + T.drift, ease: EASE_IN_OUT },
              }}
            />
          ),
        )}
        {!reduced && failing.map((p) => (p.k < cut ? <Snap key={`s-${p.c.id}`} x1={CX} y1={CY} x2={p.x} y2={p.y} /> : null))}

        {/* Fee pulses: a company lets go of one, the holdco pulls it in */}
        {pulses.map((u) => (
          <g key={u.id} pointerEvents="none">
            <m.circle cx={u.p.x} cy={u.p.y} fill="none" stroke="var(--pulse)" strokeWidth={1.2} initial={{ r: u.p.r, opacity: 0.7 }} animate={{ r: u.p.r + 11, opacity: 0 }} transition={{ duration: 0.8, ease: EASE_OUT }} />
            <m.circle
              r={pulseR * 0.6}
              fill="var(--pulse)"
              initial={{ cx: u.p.x, cy: u.p.y, opacity: 0 }}
              animate={{ cx: CX, cy: CY, opacity: [0, 0.4, 0.4, 0] }}
              transition={{ duration: u.dur, delay: 0.08, ease: EASE_PULL, opacity: { duration: u.dur, delay: 0.08, times: [0, 0.2, 0.8, 1] } }}
            />
            <m.circle
              r={pulseR}
              fill="var(--pulse)"
              initial={{ cx: u.p.x, cy: u.p.y, opacity: 0 }}
              animate={{ cx: CX, cy: CY, opacity: [0, 1, 1, 0.9] }}
              transition={{ duration: u.dur, ease: EASE_PULL, opacity: { duration: u.dur, times: [0, 0.15, 0.85, 1] } }}
              onAnimationComplete={() => arrive(u)}
            />
          </g>
        ))}

        {/* The holdco: every arriving fee makes it ripple */}
        {ripples.map((id) => (
          <m.circle
            key={id}
            cx={CX}
            cy={CY}
            fill="none"
            stroke="var(--pulse)"
            strokeWidth={1.4}
            initial={{ r: 27, opacity: 0.6 }}
            animate={{ r: 64, opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
            onAnimationComplete={() => setRipples((rs) => rs.filter((x) => x !== id))}
          />
        ))}
        <m.g style={svgOrigin} initial={init({ scale: 0 })} animate={go ? { scale: 1 } : undefined} transition={{ ...SPRING_POP, delay: delay + T.holdco }}>
          <circle cx={CX} cy={CY} r={40} fill="none" stroke="var(--line-2)" />
          <m.g key={kick} style={svgOrigin} initial={kick ? { scale: 1.1 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 12 }}>
            <circle cx={CX} cy={CY} r={26} fill="var(--ink)" />
            <g transform={`translate(${CX - 9}, ${CY - 9})`}>
              <circle cx="4" cy="4" r="2.6" fill="var(--bg)" />
              <circle cx="14" cy="4" r="2.6" fill="var(--bg)" />
              <circle cx="4" cy="14" r="2.6" fill="var(--bg)" />
              <circle cx="14" cy="14" r="2.6" fill="var(--alive)" />
            </g>
          </m.g>
        </m.g>
        <m.text
          x={CX}
          y={CY + 62}
          textAnchor="middle"
          className="fill-ink font-mono tracking-[0.08em]"
          fontSize={small}
          initial={init({ opacity: 0 })}
          animate={go ? { opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: delay + T.holdco + 0.3 }}
        >
          DOTCO HOLDCO
        </m.text>

        {/* Companies */}
        {placed.map((p) => {
          const on = active === p.c.id
          const dim = active !== null && !on
          const isNew = p.c.id === highlight
          const out = p.c.status === 'distressed'
          const red = out && fallen
          const fill = red ? 'var(--red)' : p.c.status === 'paused' ? 'var(--bg)' : 'var(--alive)'
          const landed = delay + T.dots + (p.ring / RECEIVERSHIP) * 0.55 + p.k * 0.025 + (isNew ? 1.1 : 0)
          const offset = out && p.from && !fallen ? { x: p.from.x - p.x, y: p.from.y - p.y } : { x: 0, y: 0 }
          const fallDelay = p.k * T.fallStep + T.drift
          return (
            <m.g
              key={p.c.id}
              className="cursor-pointer outline-none"
              initial={false}
              animate={{ opacity: dim ? 0.35 : 1, ...offset }}
              transition={{ opacity: { duration: 0.2 }, x: { duration: T.fallFor, delay: fallDelay, ease: EASE_IN_OUT }, y: { duration: T.fallFor, delay: fallDelay, ease: EASE_IN_OUT } }}
              onMouseEnter={() => setActive(p.c.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.c.id)}
              onBlur={() => setActive(null)}
              onClick={() => !isNew && navigate(`/company/${p.c.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && !isNew && navigate(`/company/${p.c.id}`)}
              tabIndex={isNew ? -1 : 0}
              role={isNew ? undefined : 'link'}
              aria-label={`${p.c.name}, ${p.c.runwayDays} days of runway`}
            >
              {/* generous invisible hit area */}
              <circle cx={p.x} cy={p.y} r={Math.max(p.r + 10, 20)} fill="transparent" />
              <AnimatePresence>
                {on && (
                  <m.circle
                    key="focus"
                    cx={p.x}
                    cy={p.y}
                    fill="none"
                    stroke="var(--ink)"
                    strokeOpacity={0.35}
                    initial={{ r: p.r, opacity: 0 }}
                    animate={{ r: p.r + 7, opacity: 1 }}
                    exit={{ r: p.r + 3, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                  />
                )}
              </AnimatePresence>
              {isNew && go && !reduced && (
                <m.circle
                  cx={p.x}
                  cy={p.y}
                  fill="none"
                  stroke="var(--pulse)"
                  strokeWidth={2}
                  initial={{ r: p.r, opacity: 0 }}
                  animate={{ r: [p.r, p.r + 30], opacity: [0.9, 0] }}
                  transition={{ duration: 1.5, delay: landed + 0.1, repeat: 2, ease: EASE_OUT }}
                />
              )}
              <m.g style={svgOrigin} initial={init({ scale: 0 })} animate={go ? { scale: 1 } : undefined} transition={{ ...SPRING_POP, delay: landed }}>
                <g
                  className={cn(p.c.status === 'active' && 'breathe', out && p.k < cut && 'flatline')}
                  style={p.c.status === 'active' ? { animationDuration: `${3.2 + p.phase * 1.8}s`, animationDelay: `${-p.phase * 5}s` } : undefined}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    fill={fill}
                    stroke={p.c.status === 'paused' ? 'var(--ink)' : 'var(--bg)'}
                    strokeWidth={p.c.status === 'paused' ? 1.8 : 2}
                    style={{ transition: `fill 0.5s ease ${out ? p.k * T.fallStep : 0}s` }}
                  />
                </g>
              </m.g>
              <m.text
                x={p.label.x}
                y={p.label.y}
                textAnchor={p.label.anchor}
                className={cn('font-mono', red ? 'fill-red' : isNew ? 'fill-[var(--lime-text)] font-semibold' : 'fill-ink')}
                style={{ transition: `fill 0.5s ease ${out ? p.k * T.fallStep : 0}s` }}
                fontSize={font}
                initial={init({ opacity: 0 })}
                animate={go ? { opacity: 1 } : undefined}
                transition={{ duration: 0.5, delay: landed + 0.15 }}
              >
                ${p.c.ticker}
              </m.text>
            </m.g>
          )
        })}
      </svg>

      {/* once the story has played, it can be played again */}
      <AnimatePresence>
        {!reduced && cut >= nFailing && (
          <m.button
            type="button"
            onClick={onReplay}
            className="absolute top-0 right-0 flex h-8 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase hover-device:hover:bg-hover hover-device:hover:text-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RotateCcw className="size-3" /> Replay
          </m.button>
        )}
      </AnimatePresence>

      {/* The company under the pointer */}
      <AnimatePresence>
        {shown && shown.c.id !== highlight && (
          <div
            key={shown.c.id}
            className="pointer-events-none absolute z-10 hidden w-64 sm:block"
            style={{
              left: `${(shown.x / W) * 100}%`,
              top: `${(shown.y / H) * 100}%`,
              transform: `translate(${shown.side === 1 ? 'calc(-100% - 24px)' : '24px'}, -50%)`,
            }}
          >
            <m.div
              className="rounded-card border border-line bg-surface p-4 shadow-card"
              initial={{ opacity: 0, scale: 0.96, x: shown.side === 1 ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
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
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A line snapping: two halves spring apart and fade, with a red spark where it broke. */
function Snap({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const at = (t: number) => ({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t })
  const mid = at(0.58)
  const a = at(0.3)
  const b = at(0.82)
  return (
    <g pointerEvents="none">
      <m.line x1={x1} y1={y1} stroke="var(--ink)" initial={{ x2: mid.x, y2: mid.y, strokeOpacity: 0.35 }} animate={{ x2: a.x, y2: a.y, strokeOpacity: 0 }} transition={{ duration: 0.9, ease: EASE_OUT }} />
      <m.line x2={x2} y2={y2} stroke="var(--red)" initial={{ x1: mid.x, y1: mid.y, strokeOpacity: 0.6 }} animate={{ x1: b.x, y1: b.y, strokeOpacity: 0 }} transition={{ duration: 0.9, ease: EASE_OUT }} />
      <m.circle cx={mid.x} cy={mid.y} fill="none" stroke="var(--red)" strokeWidth={1.5} initial={{ r: 2, opacity: 0.9 }} animate={{ r: 18, opacity: 0 }} transition={{ duration: 0.8, ease: EASE_OUT }} />
      <m.circle cx={mid.x} cy={mid.y} fill="var(--red)" initial={{ r: 3.5, opacity: 1 }} animate={{ r: 0, opacity: 0 }} transition={{ duration: 0.5, ease: 'easeIn' }} />
    </g>
  )
}

/** How to read the Field. */
export function FieldLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-3', className)}>
      <li className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-alive" /> Active
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
