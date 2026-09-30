import { AnimatePresence, m } from 'motion/react'
import type { Bid } from '@/types'
import { cn } from '@/lib/cn'
import { ago, sol } from '@/lib/format'
import { useNow } from '@/lib/live'
import { EASE_OUT } from '@/lib/motion'
import { DotBar } from '@/components/dots/DotBar'
import { agentLabel } from './agents'

export interface Rung {
  id: string
  bidder: string
  amountSol: number
  at: number
  agent: Bid['agent']
  plan: string
  mine?: boolean
}

/**
 * Every bid, highest first, each drawn as a row of dots against the leading bid.
 * A new bid (yours) slides into its place and the others make room.
 */
export function BidLadder({ rungs }: { rungs: Rung[] }) {
  const now = useNow()
  const max = rungs[0]?.amountSol ?? 1
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      <AnimatePresence initial={false}>
        {rungs.map((r, i) => {
          const leading = i === 0
          return (
            <m.li
              key={r.id}
              layout="position"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, layout: { type: 'spring', stiffness: 380, damping: 36 } }}
              className={cn('grid grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 bg-surface px-4 py-4 sm:grid-cols-[18px_minmax(0,1fr)_auto] sm:px-5', r.mine && 'bg-lime-soft')}
            >
              <span className={cn('mt-1.5 size-2.5 rounded-full', leading ? 'live-dot bg-alive text-alive' : 'bg-ink-4')} aria-hidden />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold">{r.mine ? 'You' : r.bidder}</span>
                  {leading && <span className="rounded-full bg-lime-soft px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-lime-text uppercase">Leading</span>}
                  <span className="text-[12px] text-ink-3">{agentLabel[r.agent]}</span>
                </p>
                <p className="mt-1 text-[14px] text-ink-2">{r.plan}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-[15px] font-medium tabular">{sol(r.amountSol, 0)}</span>
                <DotBar value={r.amountSol} max={max} dots={16} tone={leading ? 'alive' : 'ink'} className="max-sm:hidden" />
                <span className="font-mono text-[11px] text-ink-4">{ago(new Date(r.at).toISOString(), now)}</span>
              </div>
            </m.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}
