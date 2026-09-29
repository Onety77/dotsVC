import type { NetworkStats } from '@/types'
import { cn } from '@/lib/cn'
import { count, sol, usd } from '@/lib/format'

/** The network in five numbers, split by hairlines. NORA: sample aggregates. */
export function StatsStrip({ stats }: { stats: NetworkStats }) {
  const items = [
    { k: 'Companies', v: count(stats.companies) },
    { k: 'Creator fees, 30 days', v: usd(stats.fees30dUsd) },
    { k: 'Network treasury', v: sol(stats.treasurySol, 0) },
    { k: 'Average runway', v: `${stats.avgRunwayDays} days` },
    { k: 'In receivership', v: count(stats.inReceivership), red: true },
  ]
  return (
    <section aria-label="Network numbers" className="border-y border-line">
      <dl className="wrap grid grid-cols-2 lg:grid-cols-5">
        {items.map((it, i) => (
          <div
            key={it.k}
            className={cn(
              'py-6 pr-4 lg:py-8',
              i % 2 === 1 && 'border-l border-line pl-5 lg:pl-6',
              i >= 2 && 'border-t border-line lg:border-t-0',
              i >= 1 && 'lg:border-l lg:pl-6',
              i === 4 && 'col-span-2 lg:col-span-1',
            )}
          >
            <dt className="text-[13px] text-ink-3">{it.k}</dt>
            <dd className={cn('mt-2 font-mono text-stat font-medium tabular', it.red && 'text-red')}>{it.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
