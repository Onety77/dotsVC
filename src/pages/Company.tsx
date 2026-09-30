import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import { getCompany, listings } from '@/data/network'
import { count, day, price, sol, usd } from '@/lib/format'
import { Countdown } from '@/components/motion/Countdown'
import { TravelLink } from '@/components/motion/TravelLink'
import { travel } from '@/lib/travel'
import { CountUp } from '@/components/motion/CountUp'
import { History } from '@/components/company/History'
import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/lib/button'
import { Notice } from '@/components/ui/Notice'
import { Figures } from '@/components/ui/PageHeader'
import { Status } from '@/components/ui/Status'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { AgentConsole } from '@/components/company/AgentConsole'
import { MarketCard } from '@/components/company/MarketCard'
import { MoneyPanel } from '@/components/company/MoneyPanel'
import { Item, Stagger } from '@/components/motion/Reveal'
import { RunwayPanel } from '@/components/company/RunwayPanel'

const kindLabel = { store: 'Store', app: 'App', game: 'Game', bot: 'Bot', content: 'Content' } as const

export function CompanyPage() {
  const { id = '' } = useParams()
  const c = getCompany(id)
  if (!c) {
    return (
      <div className="wrap py-16">
        <Notice kind="empty" title="No company at this address." body="It may have been renamed, or the link is mistyped.">
          <Link to="/network" className="mt-4 text-sm font-semibold underline decoration-line-2 underline-offset-4">
            Back to the network
          </Link>
        </Notice>
      </div>
    )
  }
  const listing = listings.find((l) => l.companyId === c.id)

  return (
    <>
      {listing && (
        <div className="border-b border-red/30 bg-red-soft">
          <div className="wrap flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px]">
              <span aria-hidden className="heartbeat mr-2.5 inline-block size-2 -translate-y-px rounded-full bg-red align-middle" />
              <span className="font-semibold text-red">In receivership.</span> {listing.reason}. Auction ends in{' '}
              <Countdown to={listing.auctionEndsAt} urgentClass="" />.
            </p>
            <Button to={`/receivership/${c.id}`} variant="danger" size="sm" arrow>
              See the auction
            </Button>
          </div>
        </div>
      )}

      <div className="border-b border-line">
        <div className="wrap pt-8 pb-8 lg:pt-10">
          <TravelLink to="/network" travelId={c.id} className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-3 hover-device:hover:text-ink">
            <ChevronLeft className="size-4" /> Network
          </TravelLink>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <DotGlyph seed={c.ticker} status={c.status} size={72} src={c.image} travelId={c.id} travelFixed reveal={false} />
              <div className="min-w-0">
                <h1 className="w-fit max-w-full truncate text-h1 font-semibold" {...travel('name', c.id, true)}>
                  {c.name}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-mono text-sm text-ink-3">${c.ticker}</span>
                  <Status status={c.status} />
                  <span className="text-[13px] text-ink-3">Launched {day(c.launchedAt)}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="https://pump.fun" target="_blank" rel="noreferrer" className={buttonClass(listing ? 'secondary' : 'primary', 'md')}>
                Trade on PumpSwap <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
          <p className="mt-6 max-w-[60ch] text-lead text-ink-2">{c.tagline}</p>
          <Figures
            items={[
              { k: 'Price', v: price(c.priceUsd) },
              { k: 'Market cap', v: <CountUp value={c.marketCapUsd} format={usd} /> },
              { k: 'Holders', v: <CountUp value={c.holders} format={(n) => count(Math.round(n))} /> },
              { k: 'Volume, 24h', v: <CountUp value={c.volume24hUsd} format={usd} /> },
              { k: 'Treasury', v: <CountUp value={c.treasurySol} format={(n) => sol(n)} /> },
            ]}
          />
        </div>
      </div>

      <div className="wrap grid items-start gap-6 py-10 lg:grid-cols-12 lg:py-12 [&>*]:min-w-0">
        <MarketCard company={c} className="lg:col-span-7" />
        <AgentConsole company={c} showJobs={false} className="lg:col-span-5" />
        <MoneyPanel company={c} className="lg:col-span-7" />
        <RunwayPanel company={c} className="lg:col-span-5" />
      </div>

      <div className="wrap grid items-start gap-6 pb-16 lg:grid-cols-12 lg:pb-24 [&>*]:min-w-0">
        <section aria-labelledby="shipped" className="lg:col-span-7">
          <h2 id="shipped" className="text-h3 font-semibold">
            What it has shipped
          </h2>
          {c.artifacts.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-line-2 px-5 py-8 text-[15px] text-ink-3">Nothing shipped yet.</p>
          ) : (
            <Stagger as="ul" gap={0.08} className="mt-4 grid gap-3 sm:grid-cols-2">
              {c.artifacts.map((a) => (
                <Item as="li" key={a.id} className="flex flex-col rounded-card border border-line bg-surface p-5">
                  <p className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <DotGlyph seed={`${c.ticker}-${a.id}`} status="active" size={28} />
                      <span className="label">{kindLabel[a.kind]}</span>
                    </span>
                    <span className="font-mono text-[12px] text-ink-3">v{a.version}</span>
                  </p>
                  <p className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">{a.name}</p>
                  <p className="mt-auto pt-4 font-mono text-[15px] text-lime-text">{a.note}</p>
                </Item>
              ))}
            </Stagger>
          )}
        </section>
        <section aria-labelledby="history" className="lg:col-span-5">
          <h2 id="history" className="text-h3 font-semibold">
            History
          </h2>
          <History company={c} />
        </section>
      </div>
    </>
  )
}
