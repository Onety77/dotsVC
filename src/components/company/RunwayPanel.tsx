import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { critical, sol, usd } from '@/lib/format'
import { RunwayDots } from '@/components/dots/RunwayDots'

/**
 * How long the company survives, drawn as weeks you can count.
 * Runway = treasury ÷ today's burn. Spending pauses under three weeks; receivership at zero.
 */
export function RunwayPanel({ company, className }: { company: Company; className?: string }) {
  const red = critical(company.runwayDays)
  const weeks = Math.ceil(company.runwayDays / 7)
  return (
    <div className={cn('rounded-card border border-line bg-surface p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="label">Runway</p>
        <p className="text-[13px] text-ink-3">One dot = one week at today’s burn</p>
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className={cn('font-mono text-[40px] leading-none font-medium tracking-[-0.04em] tabular', red && 'text-red')}>{company.runwayDays}</span>
        <span className="text-ink-2">days · about {weeks} {weeks === 1 ? 'week' : 'weeks'}</span>
      </p>
      <RunwayDots days={company.runwayDays} weeks={16} size="lg" className="mt-5 flex-wrap" />
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-4">
        <span>Today</span>
        <span>16 weeks</span>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
        <div>
          <dt className="text-[12px] text-ink-3">Treasury</dt>
          <dd className="mt-1 font-mono text-sm">{sol(company.treasurySol)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Burn per day</dt>
          <dd className="mt-1 font-mono text-sm">{sol(company.burnSolPerDay, 2)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Fees, 30 days</dt>
          <dd className="mt-1 font-mono text-sm">{usd(company.fees30dUsd)}</dd>
        </div>
      </dl>
      <p className="mt-5 text-[13px] text-ink-3">
        {company.status === 'distressed'
          ? 'Runway ran out. The company is in receivership and its agent is offline.'
          : company.status === 'paused'
            ? 'Under three weeks: spending is paused until fees catch up or holders approve a plan.'
            : 'Spending pauses automatically under three weeks. At zero, the company goes into receivership.'}
      </p>
    </div>
  )
}
