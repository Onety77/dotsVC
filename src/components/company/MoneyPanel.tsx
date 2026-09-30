import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import type { Company, Job } from '@/types'
import { cn } from '@/lib/cn'
import { sol } from '@/lib/format'
import { sampleWeeks } from '@/lib/market'
import { useMedia } from '@/lib/useMedia'
import { DotsLoader } from '@/components/motion/DotsLoader'


const state: Record<Job['status'], { label: string; cls: string }> = {
  shipping: { label: 'In escrow', cls: 'text-lime-text' },
  done: { label: 'Paid', cls: 'text-ink-3' },
  queued: { label: 'Queued', cls: 'text-ink-4' },
  blocked: { label: 'Blocked', cls: 'text-red' },
}

/** A row of dots, filled left to right when first seen. */
function DotRow({ value, max, tone, seen, delay, dots }: { value: number; max: number; tone: 'alive' | 'ink'; seen: boolean; delay: number; dots: number }) {
  const lit = value > 0 ? Math.max(1, Math.round((value / max) * dots)) : 0
  return (
    <span className="flex gap-[3px]" aria-hidden>
      {Array.from({ length: dots }, (_, i) => (
        <span
          key={i}
          className={cn('runway-dot size-[6px] shrink-0 rounded-full', seen && i < lit ? (tone === 'alive' ? 'bg-alive' : 'bg-ink') : 'bg-[var(--dot-dim)]')}
          style={{ transitionDelay: `${delay + i * 22}ms` }}
        />
      ))}
    </span>
  )
}

/**
 * Where the money goes: four weeks of creator fees in against the agent's spending out,
 * and every job the treasury pays for, through escrow.
 */
export function MoneyPanel({ company: c, className }: { company: Company; className?: string }) {
  const weeks = sampleWeeks(c)
  // fewer, same-sized dots on phones so each row fits
  const dots = useMedia('(min-width: 640px)') ? 24 : 16
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const seen = inView || Boolean(reduced)
  const totalIn = weeks.reduce((a, w) => a + w.inSol, 0)
  const totalOut = weeks.reduce((a, w) => a + w.outSol, 0)
  const net = totalIn - totalOut
  const max = Math.max(...weeks.flatMap((w) => [w.inSol, w.outSol]), 0.01)
  const jobs = [...c.jobs].sort((a, b) => ['shipping', 'queued', 'blocked', 'done'].indexOf(a.status) - ['shipping', 'queued', 'blocked', 'done'].indexOf(b.status))

  return (
    <div ref={ref} className={cn('rounded-card border border-line bg-surface p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="label">Where the money goes</p>
        <p className="text-[13px] text-ink-3">Last four weeks</p>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <dt className="flex items-center gap-1.5 text-[12px] text-ink-3">
            <span className="size-2 rounded-full bg-alive" /> Fees in
          </dt>
          <dd className="mt-1 font-mono text-[18px] font-medium tabular">{sol(totalIn, 1)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[12px] text-ink-3">
            <span className="size-2 rounded-full bg-ink" /> Spent
          </dt>
          <dd className="mt-1 font-mono text-[18px] font-medium tabular">{sol(totalOut, 1)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Net</dt>
          <dd className={cn('mt-1 font-mono text-[18px] font-medium tabular', net >= 0 ? 'text-lime-text' : 'text-red')}>
            {net >= 0 ? '+' : '−'}
            {sol(Math.abs(net), 1)}
          </dd>
        </div>
      </dl>

      {/* each week: fees in (lime) over spending out (ink), one dot per slice of the busiest week */}
      <ol className="mt-6 grid gap-3" aria-label="Weekly fees in and spending out">
        {weeks.map((w, i) => (
          <li key={w.label} className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3 whitespace-nowrap">
            <span className="font-mono text-[11px] text-ink-4">{w.label}</span>
            <span className="grid gap-1.5">
              <span className="flex items-center gap-3">
                <DotRow value={w.inSol} max={max} tone="alive" seen={seen} delay={i * 110} dots={dots} />
                <span className="font-mono text-[11px] text-ink-3 tabular">{w.inSol.toFixed(1)}</span>
              </span>
              <span className="flex items-center gap-3">
                <DotRow value={w.outSol} max={max} tone="ink" seen={seen} delay={i * 110 + 50} dots={dots} />
                <span className="font-mono text-[11px] text-ink-3 tabular">{w.outSol.toFixed(1)}</span>
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-7 border-t border-line pt-5">
        <p className="label mb-3">Paid through escrow</p>
        {jobs.length ? (
          <ol>
            {jobs.map((j, i) => (
              <li key={j.id} className="relative grid grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-3 pb-3.5 last:pb-0">
                {i < jobs.length - 1 && <span aria-hidden className="absolute top-3 bottom-0 left-[4px] w-px bg-line-2" />}
                <span className={cn('relative mt-1.5 size-2.5 rounded-full', j.status === 'shipping' ? 'bg-alive' : j.status === 'done' ? 'bg-ink-4' : j.status === 'blocked' ? 'bg-red' : 'border-[1.5px] border-ink-4 bg-surface')} />
                <span className={cn('text-[15px]', j.status === 'done' && 'text-ink-3')}>{j.title}</span>
                <span className="flex items-center gap-3 text-right">
                  {j.costSol > 0 && <span className="font-mono text-[13px] tabular">{sol(j.costSol)}</span>}
                  <span className={cn('flex w-[86px] items-center justify-end gap-1.5 font-mono text-[12px]', state[j.status].cls)}>
                    {j.status === 'shipping' && c.agent.state === 'working' && <DotsLoader className="size-3 text-ink" label="In progress" />}
                    {state[j.status].label}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14px] text-ink-3">{c.status === 'distressed' ? `Spending stopped when ${c.name} entered receivership.` : 'No jobs yet. The agent hasn’t spent anything.'}</p>
        )}
        <p className="mt-5 text-[12px] text-ink-3">The agent can’t move the treasury. It can only pay for jobs its mandate allows, and every payment sits in escrow until the work ships.</p>
      </div>
    </div>
  )
}
