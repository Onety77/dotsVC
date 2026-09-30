import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { m } from 'motion/react'
import { bidsFor, getCompany, listings } from '@/data/network'
import { count, sol, usd } from '@/lib/format'
import { placeBid, sampleNowMs, useMyBids } from '@/lib/live'
import { EASE_OUT } from '@/lib/motion'
import { seeded } from '@/lib/seeded'
import { travel } from '@/lib/travel'
import { Notice } from '@/components/ui/Notice'
import { Figures } from '@/components/ui/PageHeader'
import { SectionHead } from '@/components/ui/Section'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { BidDialog } from '@/components/company/BidDialog'
import { History } from '@/components/company/History'
import { RunwayPanel } from '@/components/company/RunwayPanel'
import { AuctionPanel } from '@/components/auction/AuctionPanel'
import { BidLadder, type Rung } from '@/components/auction/BidLadder'
import { RescuePlans } from '@/components/auction/RescuePlans'
import { Countdown } from '@/components/motion/Countdown'
import { CountUp } from '@/components/motion/CountUp'
import { Rolling } from '@/components/motion/Rolling'
import { Button } from '@/components/ui/Button'
import { TravelLink } from '@/components/motion/TravelLink'

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

/**
 * One company's auction: what's for sale, the bids and the plans behind them, and how the
 * company got here. The clock and the bid action stay in reach (a side panel on desktop,
 * a bar pinned to the bottom on phones). `?bid=1` opens the bid dialog on arrival.
 */
export function AuctionPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const c = getCompany(id)
  const listing = listings.find((l) => l.companyId === id)
  const mine = useMyBids().find((b) => b.companyId === id)
  const [open, setOpenState] = useState(params.get('bid') === '1')
  // a fresh dialog each time it opens
  const [take, setTake] = useState(0)
  const setOpen = (v: boolean) => {
    if (v) setTake((t) => t + 1)
    setOpenState(v)
  }

  const rungs = useMemo<Rung[]>(() => {
    const theirs: Rung[] = bidsFor(id).map((b) => ({ ...b, at: Date.parse(b.at) }))
    const all = mine ? [...theirs, { id: 'mine', bidder: 'You', amountSol: mine.amountSol, at: mine.at, agent: mine.agent, plan: mine.plan, mine: true }] : theirs
    return all.sort((a, b) => b.amountSol - a.amountSol || b.at - a.at)
  }, [id, mine])

  if (!c || !listing) {
    return (
      <div className="wrap py-16">
        <Notice kind="empty" title="There’s no auction here." body="It may have closed, or the company was never in receivership.">
          <Link to="/receivership" className="mt-4 text-sm font-semibold underline decoration-line-2 underline-offset-4">
            See companies for sale
          </Link>
        </Notice>
      </div>
    )
  }

  const top = rungs[0]?.amountSol ?? 0
  const members = Math.round(c.holders * (0.25 + seeded(`${c.id}-tg`)() * 0.2))
  const closeDialog = () => {
    setOpen(false)
    if (params.get('bid')) setParams({}, { replace: true })
  }

  return (
    <>
      <div className="border-b border-line">
        <div className="wrap pt-8 pb-8 lg:pt-10">
          <TravelLink to="/receivership" travelId={c.id} className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-3 hover-device:hover:text-ink">
            <ChevronLeft className="size-4" /> Companies for sale
          </TravelLink>
          <div className="mt-6 flex min-w-0 items-center gap-5">
            <DotGlyph seed={c.ticker} status="distressed" size={72} src={c.image} travelId={c.id} travelFixed reveal={false} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-red uppercase">
                <span aria-hidden className="heartbeat inline-block size-1.5 rounded-full bg-red" /> For sale
              </p>
              <h1 className="mt-1 w-fit max-w-full truncate text-h1 font-semibold" {...travel('name', c.id, true)}>
                {c.name}
              </h1>
              <p className="mt-1 text-[15px] text-ink-2">
                <span className="font-mono text-sm text-ink-3">${c.ticker}</span> · {listing.reason}
              </p>
            </div>
          </div>
          <Figures
            items={[
              { k: 'Treasury', v: <CountUp value={c.treasurySol} format={(n) => sol(n)} /> },
              { k: 'Holders', v: <CountUp value={c.holders} format={(n) => count(Math.round(n))} /> },
              { k: 'Telegram', v: <CountUp value={members} format={(n) => count(Math.round(n))} /> },
              { k: 'Market cap', v: <CountUp value={c.marketCapUsd} format={usd} /> },
              { k: 'Shipped', v: c.artifacts.length ? `${c.artifacts.length} products` : 'Nothing yet' },
            ]}
          />
        </div>
      </div>

      <div className="wrap grid gap-10 pt-10 pb-28 lg:grid-cols-12 lg:gap-12 lg:pt-12 lg:pb-24 [&>*]:min-w-0">
        <div className="flex flex-col gap-14 lg:col-span-8">
          <section aria-labelledby="bids-title">
            <SectionHead id="bids-title" label="The bids" title={rungs.length ? `${rungs.length} ${rungs.length === 1 ? 'bid' : 'bids'} to rescue ${c.name}` : 'No bids yet'} className="[&_h2]:text-h3" />
            <div className="mt-6">
              {rungs.length ? (
                <BidLadder rungs={rungs} />
              ) : (
                <Notice kind="empty" title={`The reserve is ${sol(listing.reservePriceSol, 0)}.`} body="Nobody has bid yet. The first plan sets the tone." action="Place the first bid" onAction={() => setOpen(true)} />
              )}
            </div>
          </section>

          {rungs.length > 0 && (
            <section aria-labelledby="plans-title">
              <SectionHead id="plans-title" label="Rescue plans" title="What they’d do with it" className="[&_h2]:text-h3" />
              <div className="mt-6">
                <RescuePlans rungs={rungs} />
              </div>
            </section>
          )}

          <section aria-labelledby="story-title">
            <SectionHead id="story-title" label="How it got here" title="From launch to receivership" className="[&_h2]:text-h3" />
            <div className="mt-6 grid items-start gap-6 md:grid-cols-2 [&>*]:min-w-0">
              <RunwayPanel company={c} />
              <History company={c} className="mt-0" />
            </div>
          </section>
        </div>

        <aside aria-label="Auction" className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24">
            <AuctionPanel listing={listing} top={top} leader={rungs[0]?.bidder} count={rungs.length} mineLeading={Boolean(rungs[0]?.mine)} onBid={() => setOpen(true)} />
          </div>
        </aside>
      </div>

      {/* phones: the clock and the action stay pinned to the bottom */}
      <m.div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md lg:hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
      >
        <div className="wrap flex items-center gap-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[15px] font-medium">
              <Rolling value={top || listing.reservePriceSol} text={sol(top || listing.reservePriceSol, 0)} />
            </p>
            <p className="text-[12px] text-ink-3">
              Ends in <Countdown to={listing.auctionEndsAt} />
            </p>
          </div>
          <Button variant="primary" onClick={() => setOpen(true)}>
            {rungs[0]?.mine ? 'Raise bid' : 'Place bid'}
          </Button>
        </div>
      </m.div>

      <BidDialog
        key={take}
        open={open}
        onClose={closeDialog}
        company={c}
        listing={{ ...listing, topBidSol: top || undefined }}
        onSubmit={async (b) => {
          await wait(900)
          placeBid({ companyId: c.id, amountSol: b.amountSol, plan: b.plan, agent: b.agent as Rung['agent'], at: sampleNowMs() })
        }}
      />
    </>
  )
}
