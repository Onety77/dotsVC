import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { critical, usd } from '@/lib/format'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { RunwayDots } from '@/components/dots/RunwayDots'
import { Status } from '@/components/ui/Status'

const cols = 'lg:grid-cols-[minmax(0,1.6fr)_132px_minmax(0,1.3fr)_112px_112px_minmax(0,1.5fr)_16px]'

/**
 * Companies as a ledger: identity, state, runway you can count, money, and what the agent is doing.
 * A table on wide screens, cards on phones.
 */
export function CompanyTable({ companies, className }: { companies: Company[]; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <div className={cn('hidden gap-5 border-b border-line px-5 py-3 lg:grid', cols)}>
        {['Company', 'Status', 'Runway', 'Fees, 30d', 'Market cap', 'Agent is working on'].map((h, i) => (
          <span key={h} className={cn('label', (i === 3 || i === 4) && 'text-right')}>
            {h}
          </span>
        ))}
        <span />
      </div>
      <ul>
        {companies.map((c) => (
          <li key={c.id} className="border-t border-line first:border-t-0">
            <Link
              to={`/company/${c.id}`}
              className={cn('group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-3 px-4 py-4 transition-colors hover-device:hover:bg-hover sm:px-5', cols)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <DotGlyph seed={c.ticker} status={c.status} size={40} src={c.image} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block font-mono text-[12px] text-ink-3">${c.ticker}</span>
                </span>
              </span>
              <Status status={c.status} className="justify-self-end lg:justify-self-start" />
              <span className="col-span-2 flex items-center gap-3 lg:col-span-1">
                <RunwayDots days={c.runwayDays} size="sm" />
                <span className={cn('font-mono text-[12px] tabular', critical(c.runwayDays) ? 'text-red' : 'text-ink-2')}>{c.runwayDays}d</span>
              </span>
              <span className="text-[13px] lg:text-right">
                <span className="text-ink-3 lg:hidden">Fees </span>
                <span className="font-mono tabular">{usd(c.fees30dUsd)}</span>
              </span>
              <span className="text-right text-[13px]">
                <span className="text-ink-3 lg:hidden">Mkt cap </span>
                <span className="font-mono tabular">{usd(c.marketCapUsd)}</span>
              </span>
              <span className="col-span-2 truncate text-[13px] text-ink-2 lg:col-span-1">
                {c.jobs.find((j) => j.status === 'shipping')?.title ?? (c.status === 'distressed' ? 'Waiting for new owners' : 'Idle')}
              </span>
              <ChevronRight className="hidden size-4 text-ink-4 transition-colors group-hover:text-ink lg:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
