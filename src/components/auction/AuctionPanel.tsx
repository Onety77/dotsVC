import type { Listing } from '@/types'
import { cn } from '@/lib/cn'
import { sol } from '@/lib/format'
import { useNow } from '@/lib/live'
import { Button } from '@/components/ui/Button'
import { Countdown } from '@/components/motion/Countdown'
import { Rolling } from '@/components/motion/Rolling'

const WINDOW = 72 * 3600_000 // auctions run for three days

const endFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

/** The auction at a glance, and the one action: a ticking clock, the bid to beat, and "Place a rescue bid". */
export function AuctionPanel({ listing, top, leader, count, mineLeading, onBid, className }: { listing: Listing; top: number; leader?: string; count: number; mineLeading: boolean; onBid: () => void; className?: string }) {
  const now = useNow()
  const end = Date.parse(listing.auctionEndsAt)
  const left = end - now
  const elapsed = Math.min(1, Math.max(0, 1 - left / WINDOW))
  const soon = left < 6 * 3600_000
  const next = Math.max(listing.reservePriceSol, top + 1)
  return (
    <div className={cn('rounded-card border border-line bg-surface p-5 sm:p-6', className)}>
      <p className="label">Auction ends in</p>
      <Countdown to={listing.auctionEndsAt} className="mt-2 block text-[40px] leading-none font-medium tracking-[-0.04em]" />
      {/* how much of the three-day auction has gone */}
      <div className="relative mt-5 h-px bg-line-2" aria-hidden>
        <span className={cn('absolute inset-y-0 left-0', soon ? 'bg-red' : 'bg-ink')} style={{ width: `${elapsed * 100}%` }} />
        <span className={cn('absolute top-1/2 size-2 -translate-1/2 rounded-full', soon ? 'heartbeat bg-red' : 'bg-ink')} style={{ left: `${elapsed * 100}%` }} />
      </div>
      <p className="mt-3 font-mono text-[11px] text-ink-4">Closes {endFmt.format(end)} UTC</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
        <div className="col-span-2">
          <dt className="text-[13px] text-ink-3">{!top ? 'Reserve price' : mineLeading ? 'Top bid' : 'Bid to beat'}</dt>
          <dd className="mt-1 font-mono text-[28px] leading-none font-medium tracking-[-0.03em]">
            <Rolling value={top || listing.reservePriceSol} text={sol(top || listing.reservePriceSol, 0)} />
          </dd>
          {leader && <p className="mt-1.5 text-[13px] text-ink-2">{mineLeading ? 'You’re leading' : `by ${leader}`}</p>}
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Bids</dt>
          <dd className="mt-1 font-mono text-sm tabular">{count}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Next bid from</dt>
          <dd className="mt-1 font-mono text-sm tabular">{sol(next, 0)}</dd>
        </div>
      </dl>

      <Button variant="primary" size="lg" className="mt-6 w-full" onClick={onBid}>
        {mineLeading ? 'Raise your bid' : 'Place a rescue bid'}
      </Button>
      <p className="mt-3 text-[12px] text-ink-3">Your SOL is escrowed until the auction closes. If you’re outbid, it comes straight back.</p>
    </div>
  )
}
