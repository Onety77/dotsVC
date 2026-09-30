import { cn } from '@/lib/cn'
import { sol } from '@/lib/format'
import { Item, Stagger } from '@/components/motion/Reveal'
import { agentLabel } from './agents'
import type { Rung } from './BidLadder'

/** The top plans side by side: what each would-be owner says they'll do with the company. */
export function RescuePlans({ rungs }: { rungs: Rung[] }) {
  const top = rungs.slice(0, 3)
  return (
    <Stagger gap={0.08} className={cn('grid gap-3', top.length > 1 && 'md:grid-cols-3')}>
      {top.map((r, i) => (
        <Item key={r.id} className={cn('flex flex-col rounded-card border bg-surface p-5', i === 0 ? 'border-alive' : 'border-line')}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 truncate font-semibold">{r.mine ? 'You' : r.bidder}</p>
            <p className="shrink-0 font-mono text-sm whitespace-nowrap tabular">{sol(r.amountSol, 0)}</p>
          </div>
          <p className="mt-1 text-[12px] text-ink-3">{agentLabel[r.agent]}</p>
          <p className="mt-4 flex-1 text-[17px] leading-snug tracking-[-0.01em]">“{r.plan}”</p>
          <p className={cn('mt-5 font-mono text-[11px] tracking-[0.06em] uppercase', i === 0 ? 'text-lime-text' : 'text-ink-4')}>{i === 0 ? 'Leading plan' : `#${i + 1} bid`}</p>
        </Item>
      ))}
    </Stagger>
  )
}
