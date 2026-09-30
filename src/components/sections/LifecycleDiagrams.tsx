import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion, type Easing } from 'motion/react'
import { svgOrigin } from '@/lib/motion'

/*
  Four small dot diagrams, one per stage of a company's life. Each plays its own verb on a loop
  while it's on screen, and shows a still, complete picture off screen and under reduced motion.
*/

function usePlaying() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { margin: '-8% 0px' })
  const reduced = useReducedMotion()
  return [ref, inView && !reduced] as const
}

function Frame({ label, children, svgRef }: { label: string; children: ReactNode; svgRef: Ref<SVGSVGElement> }) {
  return (
    <svg ref={svgRef} viewBox="0 0 200 100" className="h-full w-full" role="img" aria-label={label}>
      {children}
    </svg>
  )
}

const Holdco = ({ x = 20, y = 50 }: { x?: number; y?: number }) => (
  <>
    <circle cx={x} cy={y} r={9} fill="var(--ink)" />
    <circle cx={x} cy={y} r={15} fill="none" stroke="var(--line-2)" />
  </>
)

/** 01 Launch: the holdco reaches out, and a company is born at the end of the line. */
export function LaunchDiagram() {
  const [ref, play] = usePlaying()
  const D = 4.2
  const loop = { duration: D, repeat: Infinity, ease: 'linear' as const }
  return (
    <Frame svgRef={ref} label="A new company is created and tied to the holdco">
      <Holdco />
      {play ? (
        <>
          {Array.from({ length: 13 }, (_, i) => {
            const t = 0.04 + i * 0.022
            return (
              <m.circle key={i} cx={40 + i * 8} cy={50} r={1.3} fill="var(--ink)" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0.35, 0.35, 0] }} transition={{ ...loop, times: [0, t, t + 0.03, 0.9, 0.97] }} />
            )
          })}
          <m.circle
            cx={160}
            cy={50}
            r={12}
            fill="var(--alive)"
            style={svgOrigin}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 0, 1.18, 1, 1, 0] }}
            transition={{ ...loop, times: [0, 0.34, 0.42, 0.5, 0.9, 0.97], ease: 'easeOut' }}
          />
          <m.circle cx={160} cy={50} fill="none" stroke="var(--pulse)" initial={{ r: 12, opacity: 0 }} animate={{ r: [12, 12, 30], opacity: [0, 0.7, 0] }} transition={{ ...loop, times: [0, 0.42, 0.78], ease: 'easeOut' }} />
          <m.circle cx={160} cy={50} r={20} fill="none" stroke="var(--alive)" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0.35, 0.35, 0] }} transition={{ ...loop, times: [0, 0.6, 0.7, 0.9, 0.97] }} />
        </>
      ) : (
        <>
          <line x1="35" y1="50" x2="150" y2="50" stroke="var(--ink)" strokeOpacity="0.2" strokeDasharray="2 5" strokeLinecap="round" />
          <circle cx="160" cy="50" r="12" fill="var(--alive)" />
          <circle cx="160" cy="50" r="20" fill="none" stroke="var(--alive)" strokeOpacity="0.35" />
        </>
      )}
    </Frame>
  )
}

/** 02 Hire: the agent circles the company it runs; work comes in, things ship out. */
export function HireDiagram() {
  const [ref, play] = usePlaying()
  return (
    <Frame svgRef={ref} label="An AI agent runs the company: tasks in, work shipped out">
      <circle cx="100" cy="50" r="30" fill="none" stroke="var(--line-2)" />
      {play ? (
        <>
          {[0, 1, 2].map((i) => (
            <m.circle
              key={`in-${i}`}
              cy={50}
              r={2.4}
              fill="var(--ink)"
              initial={{ cx: 30, opacity: 0 }}
              animate={{ cx: [30, 86], opacity: [0, 0.8, 0.8, 0] }}
              transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: 'easeIn', opacity: { duration: 2.4, delay: i * 0.8, repeat: Infinity, times: [0, 0.2, 0.8, 1] } }}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <m.circle
              key={`out-${i}`}
              cy={50}
              r={2.4}
              fill="var(--alive)"
              initial={{ cx: 114, opacity: 0 }}
              animate={{ cx: [114, 182], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.4, delay: 0.5 + i * 0.8, repeat: Infinity, ease: 'easeOut', opacity: { duration: 2.4, delay: 0.5 + i * 0.8, repeat: Infinity, times: [0, 0.15, 0.7, 1] } }}
            />
          ))}
          <circle cx="100" cy="50" r="12" fill="var(--alive)" />
          <m.g style={{ transformBox: 'view-box', transformOrigin: '100px 50px' }} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}>
            <circle cx="130" cy="50" r="5" fill="var(--ink)" />
          </m.g>
        </>
      ) : (
        <>
          <circle cx="100" cy="50" r="12" fill="var(--alive)" />
          <circle cx="130" cy="50" r="5" fill="var(--ink)" />
          {[0, 1, 2].map((i) => (
            <circle key={`a-${i}`} cx={40 + i * 8} cy="50" r="2.4" fill="var(--ink)" opacity={0.25 + i * 0.25} />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={`b-${i}`} cx={144 + i * 8} cy="50" r="2.4" fill="var(--ink)" opacity={0.75 - i * 0.25} />
          ))}
        </>
      )}
    </Frame>
  )
}

// fees in (+) and burn (−): more in than out, so the runway creeps up and slips back
const EARN = [1, 1, -1, 1, -1, 1, 1, -1, -1, -1, 1, -1]
const dotX = (i: number) => 24 + i * 14

/** 03 Earn: fees drop into the runway, burn takes weeks back out. */
export function EarnDiagram() {
  const [ref, play] = usePlaying()
  const [lit, setLit] = useState(8)
  const [event, setEvent] = useState<{ id: number; kind: 1 | -1; i: number } | null>(null)
  const litRef = useRef(lit)

  useEffect(() => {
    if (!play) return
    let step = 0
    let id = 0
    const timers: number[] = []
    const tick = () => {
      const kind = EARN[step % EARN.length] as 1 | -1
      step += 1
      id += 1
      const now = litRef.current
      if (kind === 1) {
        // the fee lands, then the week lights
        setEvent({ id, kind, i: now })
        timers.push(window.setTimeout(() => {
          litRef.current = now + 1
          setLit(now + 1)
        }, 620))
      } else {
        // the week goes out immediately and its dot leaves by the burn line
        litRef.current = now - 1
        setLit(now - 1)
        setEvent({ id, kind, i: now - 1 })
      }
    }
    const iv = window.setInterval(tick, 1100)
    return () => {
      window.clearInterval(iv)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [play])

  return (
    <Frame svgRef={ref} label="Creator fees add runway; spending burns it">
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={dotX(i)} cy="50" r="4.5" fill={i < (play ? lit : 8) ? 'var(--ink)' : 'var(--dot-dim)'} style={{ transition: 'fill 0.3s ease' }} />
      ))}
      <path d="M24 26 H 122" stroke="var(--alive)" strokeWidth="2" strokeLinecap="round" />
      <text x="24" y="20" className="fill-ink-3 font-mono text-[10px]">
        FEES IN
      </text>
      <path d="M136 74 H 178" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      <text x="136" y="88" className="fill-ink-3 font-mono text-[10px]">
        BURN
      </text>
      <AnimatePresence>
        {play && event && event.kind === 1 && (
          <m.circle
            key={event.id}
            r={3.2}
            fill="var(--pulse)"
            initial={{ cx: 24, cy: 26, opacity: 0 }}
            animate={{ cx: [24, dotX(event.i), dotX(event.i)], cy: [26, 26, 50], opacity: [0, 1, 1] }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.62, times: [0, 0.65, 1], ease: 'easeInOut' }}
          />
        )}
        {play && event && event.kind === -1 && (
          <m.circle
            key={event.id}
            r={3.2}
            fill="var(--ink)"
            initial={{ cx: dotX(event.i), cy: 50, opacity: 0.8 }}
            animate={{ cx: [dotX(event.i), 136, 184], cy: [50, 74, 74], opacity: [0.8, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.45, 1], ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </Frame>
  )
}

/** 04 Survive, or be sold: runway hits zero, the line is cut, a new owner takes over. */
export function SurviveDiagram() {
  const [ref, play] = usePlaying()
  const D = 6.8
  const loop = (times: number[], ease: Easing | Easing[] = 'linear') => ({ duration: D, repeat: Infinity, times, ease })
  return (
    <Frame svgRef={ref} label="A company in receivership is cut from the holdco and bought by a new owner">
      <Holdco x={40} />
      <path d="M 120 6 A 60 60 0 0 1 120 94" fill="none" stroke="var(--red)" strokeOpacity="0.55" strokeDasharray="2 5" strokeLinecap="round" />
      {play ? (
        <m.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0, 0] }} transition={loop([0, 0.05, 0.92, 0.98, 1])}>
          {/* the tie to the holdco stretches, then snaps */}
          <m.line
            x1={55}
            y1={50}
            y2={50}
            stroke="var(--ink)"
            initial={{ x2: 86, strokeOpacity: 0.25 }}
            animate={{ x2: [86, 86, 152, 152], strokeOpacity: [0.25, 0.25, 0.3, 0, 0] }}
            transition={{ x2: loop([0, 0.28, 0.5, 1], ['linear', 'easeInOut', 'linear']), strokeOpacity: loop([0, 0.28, 0.5, 0.53, 1]) }}
          />
          <m.circle cx={104} cy={50} fill="none" stroke="var(--red)" strokeWidth={1.5} initial={{ r: 2, opacity: 0 }} animate={{ r: [2, 2, 16, 16], opacity: [0, 0, 1, 0, 0] }} transition={{ r: loop([0, 0.5, 0.62, 1]), opacity: loop([0, 0.49, 0.5, 0.62, 1]) }} />
          {/* the new owner arrives and ties on */}
          <m.circle cy={50} r={5} fill="var(--ink)" initial={{ cx: 200, opacity: 0 }} animate={{ cx: [200, 200, 188, 188], opacity: [0, 0, 1, 1] }} transition={{ cx: loop([0, 0.6, 0.72, 1], ['linear', 'easeOut', 'linear']), opacity: loop([0, 0.6, 0.66, 1]) }} />
          <m.line x1={172} x2={183} y1={50} y2={50} stroke="var(--ink)" initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: [0, 0, 0.5, 0.5] }} transition={loop([0, 0.72, 0.76, 1])} />
          {/* the company: alive, then red, drifting out, then alive again under new owners */}
          <m.g initial={{ x: 0 }} animate={{ x: [0, 0, 66, 66] }} transition={loop([0, 0.28, 0.5, 1], ['linear', 'easeInOut', 'linear'])}>
            <circle cx={96} cy={50} r={10} fill="var(--alive)" />
            <m.circle cx={96} cy={50} r={10} fill="var(--red)" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={loop([0, 0.18, 0.26, 0.78, 0.84, 1])} />
            <m.circle cx={96} cy={50} fill="none" stroke="var(--pulse)" strokeWidth={1.5} initial={{ r: 10, opacity: 0 }} animate={{ r: [10, 10, 24, 24], opacity: [0, 0, 0.8, 0, 0] }} transition={{ r: loop([0, 0.8, 0.94, 1]), opacity: loop([0, 0.79, 0.8, 0.94, 1]) }} />
          </m.g>
        </m.g>
      ) : (
        <>
          <line x1="55" y1="50" x2="92" y2="50" stroke="var(--ink)" strokeOpacity="0.2" />
          <line x1="100" y1="44" x2="108" y2="56" stroke="var(--red)" strokeWidth="1.5" />
          <circle cx="160" cy="50" r="10" fill="var(--red)" />
        </>
      )}
    </Frame>
  )
}

