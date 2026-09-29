import type { NetworkStats } from '@/types'
import { cn } from '@/lib/cn'
import { count, sol, usd } from '@/lib/format'
import { CountUp } from '@/components/motion/CountUp'

/** The network in five numbers, split by hairlines. They count up once, together. */
export function StatsStrip({ stats }: { stats: NetworkStats }) {
  const items = [
    { k: 'Companies', n: stats.companies, f: (v: number) => count(Math.round(v)) },
    { k: 'Creator fees, 30 days', n: stats.fees30dUsd, f: usd },
    { k: 'Network treasury', n: stats.treasurySol, f: (v: number) => sol(v, 0) },
    { k: 'Average runway', n: stats.avgRunwayDays, f: (v: number) => `${Math.round(v)} days` },
    { k: 'In receivership', n: stats.inReceivership, f: (v: number) => count(Math.round(v)), red: true },
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
            <dd className={cn('mt-2 font-mono text-stat font-medium tabular', it.red && 'text-red')}>
              <CountUp value={it.n} format={it.f} delay={i * 0.06} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
