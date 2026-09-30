import { m, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { EASE_OUT } from '@/lib/motion'

/**
 * A page that isn't in the network: a small holdco with its companies tied on, and one
 * hollow dot adrift outside the ring, slowly wandering, with no line back.
 */
export function NotFound() {
  const reduced = useReducedMotion()
  const tied = [
    [-0.9, 64],
    [0.2, 72],
    [1.4, 58],
    [2.5, 70],
    [3.6, 62],
    [4.8, 74],
  ] as const
  return (
    <div className="wrap grid items-center gap-10 py-16 md:grid-cols-12 md:py-24">
      <div className="md:col-span-6">
        <p className="label">404</p>
        <h1 className="mt-4 text-h1 font-semibold">This page isn’t in the network.</h1>
        <p className="mt-4 max-w-[46ch] text-lead text-ink-2">The link may be old, or the page moved. Everything that is here is one tap away.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/" variant="primary" size="lg" arrow>
            Back home
          </Button>
          <Button to="/network" size="lg">
            Explore the network
          </Button>
        </div>
      </div>
      <div className="md:col-span-6">
        <svg viewBox="0 0 400 300" className="mx-auto block w-full max-w-[460px]" aria-hidden>
          <ellipse cx="200" cy="150" rx="150" ry="110" fill="none" stroke="var(--line-2)" strokeDasharray="2 6" strokeLinecap="round" />
          {tied.map(([a, r], i) => {
            const x = 200 + Math.cos(a) * r * 1.3
            const y = 150 + Math.sin(a) * r
            return (
              <g key={i}>
                <line x1="200" y1="150" x2={x} y2={y} stroke="var(--ink)" strokeOpacity="0.12" />
                <circle cx={x} cy={y} r={6 + (i % 3) * 2} fill="var(--alive)" />
              </g>
            )
          })}
          <circle cx="200" cy="150" r="18" fill="var(--ink)" />
          <circle cx="200" cy="150" r="28" fill="none" stroke="var(--line-2)" />
          {/* the lost one */}
          {reduced ? (
            <circle cx="352" cy="62" r="9" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
          ) : (
            <m.circle
              r="9"
              fill="var(--bg)"
              stroke="var(--ink)"
              strokeWidth="2"
              initial={{ cx: 330, cy: 80, opacity: 0 }}
              animate={{ cx: [330, 352, 366, 348, 330], cy: [80, 62, 74, 92, 80], opacity: 1 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.8, ease: EASE_OUT } }}
            />
          )}
        </svg>
      </div>
    </div>
  )
}
