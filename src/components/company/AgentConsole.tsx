import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { ago, sol } from '@/lib/format'
import { useNow } from '@/lib/live'
import { EASE_OUT } from '@/lib/motion'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { DotsLoader } from '@/components/motion/DotsLoader'

const jobTone = {
  shipping: 'text-lime-text',
  queued: 'text-ink-3',
  done: 'text-ink-3 line-through decoration-ink-4',
  blocked: 'text-red',
} as const
const jobLabel = { shipping: 'Shipping', queued: 'Queued', done: 'Done', blocked: 'Blocked' } as const

interface Line {
  id: number
  at: number
  text: string
  typing?: boolean
}

function nextAction(c: Company, n: number) {
  const job = c.jobs.find((j) => j.status === 'shipping')?.title ?? c.jobs[0]?.title ?? 'the roadmap'
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
  const actions = [
    `Paid a contractor ${(0.4 + Math.random() * 2.4).toFixed(1)} SOL from escrow for “${job}”`,
    `Posted a progress update on “${job}”`,
    `Checked runway: ${c.runwayDays} days at today’s burn`,
    'Declined an off-mandate request from a holder',
    `Answered ${12 + Math.floor(Math.random() * 60)} holder questions in Telegram`,
    `Routed ${(0.2 + Math.random() * 1.6).toFixed(2)} SOL of creator fees to the treasury`,
    'Filed the daily spend report on-chain',
    `Opened a bounty: “${pick(['translate the site', 'design a sticker pack', 'fix the holder dashboard'])}”`,
  ]
  return actions[n % actions.length]
}

/** A line that types itself in, with a caret, then settles. */
function Typing({ text, onDone }: { text: string; onDone: () => void }) {
  const [n, setN] = useState(0)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  useEffect(() => {
    if (n >= text.length) {
      done.current()
      return
    }
    const t = window.setTimeout(() => setN(n + 1), 24)
    return () => window.clearTimeout(t)
  }, [n, text])
  return (
    <span className="text-ink">
      {text.slice(0, n)}
      <span aria-hidden className="caret ml-px inline-block h-[1em] w-[7px] translate-y-[2px] bg-lime" />
    </span>
  )
}

/**
 * What the agent CEO is doing: its mission, its latest actions, and its jobs.
 * While it's on screen and the agent is working, new actions type themselves in at the top.
 */
export function AgentConsole({ company, className }: { company: Company; className?: string }) {
  const a = company.agent
  const now = useNow()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10% 0px' })
  const reduced = useReducedMotion()
  const [lines, setLines] = useState<Line[]>(() => a.log.map((l, i) => ({ id: -i - 1, at: Date.parse(l.at), text: l.text })))
  const nowRef = useRef(now)
  useEffect(() => {
    nowRef.current = now
  })

  const working = a.state === 'working'
  useEffect(() => {
    if (!working || !inView || reduced) return
    let n = Math.floor(Math.random() * 8)
    let id = 0
    const add = () => {
      if (document.hidden) return
      n += 1 + Math.floor(Math.random() * 3)
      id += 1
      const line = { id, at: nowRef.current, text: nextAction(company, n), typing: true }
      setLines((ls) => [line, ...ls].slice(0, 5))
    }
    const first = window.setTimeout(add, 2200)
    const iv = window.setInterval(add, 7000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(iv)
    }
  }, [working, inView, reduced, company])

  const settle = (id: number) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, typing: false } : l)))

  return (
    <div ref={ref} className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <div className="flex items-center gap-3 border-b border-line p-5">
        <DotGlyph seed={`${company.ticker}-agent`} status={company.status} size={40} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {a.name} <span className="font-normal text-ink-3">· CEO of {company.name}</span>
          </p>
          <p className="flex items-center gap-2 font-mono text-[12px] text-ink-3">
            <span className={cn('size-1.5 rounded-full', working ? 'live-dot bg-lime text-lime' : a.state === 'idle' ? 'bg-ink-4' : 'bg-red')} />
            {working ? 'Working' : a.state === 'idle' ? 'Idle' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="border-b border-line p-5">
        <p className="label">Mission</p>
        <p className="mt-2 text-[15px] leading-relaxed">{a.mission}</p>
      </div>
      <div className="border-b border-line p-5">
        <p className="label mb-3">Latest</p>
        <ol aria-live="polite" className="relative">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <m.li
                key={l.id}
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="grid grid-cols-[64px_1fr] gap-3 py-1.5 text-[14px]"
              >
                <span className={cn('font-mono text-[12px]', l.typing ? 'text-lime-text' : 'text-ink-4')}>{ago(new Date(l.at).toISOString(), now)}</span>
                {l.typing ? <Typing text={l.text} onDone={() => settle(l.id)} /> : <span className="text-ink-2">{l.text}</span>}
              </m.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
      {company.jobs.length > 0 && (
        <ul className="p-5">
          <li className="label mb-3">Jobs</li>
          {company.jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between gap-4 py-1.5 text-[14px]">
              <span className={cn('min-w-0 truncate', j.status === 'done' ? 'text-ink-3' : 'text-ink')}>{j.title}</span>
              <span className="flex shrink-0 items-center gap-3">
                {j.costSol > 0 && <span className="font-mono text-[12px] text-ink-3">{sol(j.costSol)}</span>}
                <span className={cn('flex w-[84px] items-center justify-end gap-1.5 font-mono text-[12px]', jobTone[j.status])}>
                  {j.status === 'shipping' && working && <DotsLoader className="size-3 text-ink" label="In progress" />}
                  {jobLabel[j.status]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
