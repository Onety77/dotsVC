import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
// NORA: replace with the company query keyed by :id (mint).
import { getCompany, listings, sampleNow } from '@/data/network'
import { count, countdown, day, price, sol, usd } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/lib/button'
import { Notice } from '@/components/ui/Notice'
import { Figures } from '@/components/ui/PageHeader'
import { Status } from '@/components/ui/Status'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { AgentConsole } from '@/components/company/AgentConsole'
import { PriceChart } from '@/components/company/PriceChart'
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
              <span className="font-semibold text-red">In receivership.</span> {listing.reason}. Auction ends in{' '}
              <span className="font-mono tabular">{countdown(listing.auctionEndsAt, sampleNow)}</span>.
            </p>
            <Button to={`/receivership?bid=${c.id}`} variant="danger" size="sm" arrow>
              Bid to rescue it
            </Button>
          </div>
        </div>
      )}

      <div className="border-b border-line">
        <div className="wrap pt-8 pb-8 lg:pt-10">
          <Link to="/network" className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-3 hover-device:hover:text-ink">
            <ChevronLeft className="size-4" /> Network
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <DotGlyph seed={c.ticker} status={c.status} size={72} src={c.image} />
              <div className="min-w-0">
                <h1 className="truncate text-h1 font-semibold">{c.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-mono text-sm text-ink-3">${c.ticker}</span>
                  <Status status={c.status} />
                  <span className="text-[13px] text-ink-3">Launched {day(c.launchedAt)}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* NORA: link to the coin on PumpSwap / Pump.fun */}
              <a href="https://pump.fun" target="_blank" rel="noreferrer" className={buttonClass(listing ? 'secondary' : 'primary', 'md')}>
                Trade on PumpSwap <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
          <p className="mt-6 max-w-[60ch] text-lead text-ink-2">{c.tagline}</p>
          <Figures
            items={[
              { k: 'Price', v: price(c.priceUsd) },
              { k: 'Market cap', v: usd(c.marketCapUsd) },
              { k: 'Holders', v: count(c.holders) },
              { k: 'Volume, 24h', v: usd(c.volume24hUsd) },
              { k: 'Treasury', v: sol(c.treasurySol) },
            ]}
          />
        </div>
      </div>

      <div className="wrap grid gap-6 py-10 lg:grid-cols-12 [&>*]:min-w-0 lg:py-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
          <PriceChart company={c} />
          <RunwayPanel company={c} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <AgentConsole company={c} now={sampleNow} />
        </div>
      </div>

      <div className="wrap grid gap-6 pb-16 lg:grid-cols-12 [&>*]:min-w-0 lg:pb-24">
        <section aria-labelledby="shipped" className="lg:col-span-7">
          <h2 id="shipped" className="text-h3 font-semibold">
            What it has shipped
          </h2>
          {c.artifacts.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-line-2 px-5 py-8 text-[15px] text-ink-3">Nothing shipped yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {c.artifacts.map((a) => (
                <li key={a.id} className="rounded-card border border-line bg-surface p-5">
                  <p className="flex items-center justify-between gap-3">
                    <span className="label">{kindLabel[a.kind]}</span>
                    <span className="font-mono text-[12px] text-ink-3">v{a.version}</span>
                  </p>
                  <p className="mt-3 font-semibold">{a.name}</p>
                  <p className="mt-1 text-[14px] text-ink-2">{a.note}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="history" className="lg:col-span-5">
          <h2 id="history" className="text-h3 font-semibold">
            History
          </h2>
          <ol className="mt-4 rounded-card border border-line bg-surface p-5">
            {[...c.timeline].reverse().map((e, i) => (
              <li key={e.at + e.text} className="relative grid grid-cols-[18px_64px_1fr] gap-3 pb-4 last:pb-0">
                {/* the thread of dots through the company's life */}
                {i < c.timeline.length - 1 && <span aria-hidden className="absolute top-3 bottom-0 left-[4px] w-px bg-line-2" />}
                <span className={i === 0 ? (c.status === 'distressed' ? 'mt-1.5 size-2.5 rounded-full bg-red' : 'mt-1.5 size-2.5 rounded-full bg-lime') : 'mt-1.5 size-2.5 rounded-full bg-ink-4'} />
                <span className="font-mono text-[12px] text-ink-3">{day(e.at)}</span>
                <span className="text-[15px]">{e.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
