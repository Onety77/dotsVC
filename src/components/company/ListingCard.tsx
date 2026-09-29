import { Link } from 'react-router-dom'
import type { Company, Listing } from '@/types'
import { cn } from '@/lib/cn'
import { countdown, sol, usd } from '@/lib/format'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { RunwayDots } from '@/components/dots/RunwayDots'
import { Button } from '@/components/ui/Button'

/**
 * A company for sale: why it failed, how long it has, and the auction.
 * The clock is static here; it ticks in the motion pass.
 */
export function ListingCard({
  listing,
  company,
  now,
  onBid,
  className,
}: {
  listing: Listing
  company: Company
  now: number
  onBid?: (companyId: string) => void
  className?: string
}) {
  const soon = new Date(listing.auctionEndsAt).getTime() - now < 6 * 3600_000
  return (
    <article className={cn('flex flex-col rounded-card border border-line bg-surface p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <Link to={`/company/${company.id}`} className="flex min-w-0 items-center gap-3 rounded-md">
          <DotGlyph seed={company.ticker} status="distressed" size={44} src={company.image} />
          <span className="min-w-0">
            <span className="block truncate text-[17px] font-semibold">{company.name}</span>
            <span className="block font-mono text-[12px] text-ink-3">${company.ticker}</span>
          </span>
        </Link>
        <span className="rounded-full bg-red-soft px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] text-red">FOR SALE</span>
      </div>
      <p className="mt-4 text-[15px] text-ink-2">{listing.reason}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <RunwayDots days={company.runwayDays} size="sm" weeks={10} />
        <span className="font-mono text-[12px] text-red">{company.runwayDays}d left</span>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
        <div>
          <dt className="text-[12px] text-ink-3">Market cap</dt>
          <dd className="mt-1 font-mono text-sm">{usd(company.marketCapUsd)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">{listing.topBidSol ? 'Top bid' : 'Reserve'}</dt>
          <dd className="mt-1 font-mono text-sm">{sol(listing.topBidSol ?? listing.reservePriceSol, 0)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Ends in</dt>
          <dd className={cn('mt-1 font-mono text-sm tabular', soon && 'text-red')}>{countdown(listing.auctionEndsAt, now)}</dd>
        </div>
      </dl>
      {onBid && (
        <Button variant="secondary" className="mt-5 w-full" onClick={() => onBid(company.id)}>
          Place a rescue bid
        </Button>
      )}
    </article>
  )
}
