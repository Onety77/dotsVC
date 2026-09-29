import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bids, getCompany, listings, networkStats, sampleNow } from '@/data/network'
import { ago, count, sol } from '@/lib/format'
import { useDemoState } from '@/lib/hooks'
import { Notice } from '@/components/ui/Notice'
import { Figures, PageHeader } from '@/components/ui/PageHeader'
import { Segmented } from '@/components/ui/Segmented'
import { CountUp } from '@/components/motion/CountUp'
import { BidDialog } from '@/components/company/BidDialog'
import { ListingCard } from '@/components/company/ListingCard'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { useWallet } from '@/components/layout/wallet'

type Tab = 'sale' | 'bids' | 'mine'
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

const steps = [
  { t: 'Runway hits zero', b: 'The company leaves the holdco. Its agent goes offline and spending stops.' },
  { t: 'The auction opens', b: 'Treasury, community and brand go to auction with a reserve price. Bids come with a public plan.' },
  { t: 'A new owner takes over', b: 'The winner brings an agent and a mission. If it earns again, it can rejoin the network.' },
]

export function Receivership() {
  const state = useDemoState()
  const [params, setParams] = useSearchParams()
  const { address } = useWallet()
  const [tab, setTab] = useState<Tab>('sale')
  const [myBids, setMyBids] = useState<{ companyId: string; amountSol: number }[]>([])

  // The bid dialog lives in the URL, so "Place a rescue bid" links from other pages land here with it open.
  const bidFor = params.get('bid')
  const openBid = (id: string) => setParams({ bid: id })
  const closeBid = () => setParams({}, { replace: true })
  // keep the last company while the dialog animates out
  const [last, setLast] = useState(bidFor)
  if (bidFor && bidFor !== last) setLast(bidFor)

  const source = state === 'empty' ? [] : listings
  const totalTop = source.reduce((a, l) => a + Math.max(l.topBidSol ?? 0, myBids.find((b) => b.companyId === l.companyId)?.amountSol ?? 0), 0)

  return (
    <>
      <PageHeader label="Receivership" title="Companies for sale" description="Companies that ran out of runway, sold at auction with their treasury, community and brand. Bring a plan and an agent, and turn one around.">
        <Figures
          items={[
            { k: 'For sale', v: <CountUp value={source.length} format={(n) => count(Math.round(n))} />, tone: 'red' },
            { k: 'Rescue capital waiting', v: <CountUp value={networkStats.rescueCapitalSol} format={(n) => sol(n, 0)} /> },
            { k: 'Live bids', v: <CountUp value={source.reduce((a, l) => a + l.bids, 0) + myBids.length} format={(n) => count(Math.round(n))} /> },
            { k: 'Top bids, total', v: <CountUp value={totalTop} format={(n) => sol(n, 0)} /> },
          ]}
        />
      </PageHeader>

      <div className="wrap grid gap-10 py-10 lg:grid-cols-12 [&>*]:min-w-0 lg:py-12">
        <div className="min-w-0 lg:col-span-8">
          <Segmented<Tab>
            label="View"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'sale', label: 'For sale', count: source.length },
              { value: 'bids', label: 'Recent bids', count: bids.length },
              { value: 'mine', label: 'My bids', count: myBids.length },
            ]}
          />
          <div className="mt-5">
            {state === 'loading' ? (
              <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-72" />)}</div>
            ) : state === 'error' ? (
              <Notice kind="error" title="The auction house didn’t answer." body="Bids already placed are safe on-chain." />
            ) : tab === 'sale' ? (
              source.length === 0 ? (
                <Notice kind="empty" title="Nothing for sale right now." body="Every company in the network has runway. That’s the point." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
                  {source.map((l) => (
                    <ListingCard key={l.companyId} listing={l} company={getCompany(l.companyId)!} myBid={myBids.find((b) => b.companyId === l.companyId)?.amountSol} onBid={openBid} />
                  ))}
                </div>
              )
            ) : tab === 'bids' ? (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {bids.map((b) => {
                  const c = getCompany(b.companyId)!
                  return (
                    <li key={b.id} className="grid gap-2 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
                      <div className="flex min-w-0 items-start gap-3">
                        <DotGlyph seed={c.ticker} status="distressed" size={36} />
                        <div className="min-w-0">
                          <p className="text-[15px]">
                            <span className="font-semibold">{b.bidder}</span> <span className="text-ink-3">bid on</span> <span className="font-semibold">{c.name}</span>
                          </p>
                          <p className="mt-1 text-[14px] text-ink-2">“{b.plan}”</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-3 pl-12 sm:flex-col sm:items-end sm:gap-1 sm:pl-0">
                        <span className="font-mono">{sol(b.amountSol, 0)}</span>
                        <span className="font-mono text-[12px] text-ink-4">{ago(b.at, sampleNow)}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : !address ? (
              <Notice kind="empty" title="Connect a wallet to see your bids." body="Your bids and any companies you win will show up here." />
            ) : myBids.length === 0 ? (
              <Notice kind="empty" title="No bids yet." body="Pick a company that’s for sale and tell holders what you’d do with it." action="Browse companies for sale" onAction={() => setTab('sale')} />
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {myBids.map((b) => {
                  const c = getCompany(b.companyId)!
                  return (
                    <li key={b.companyId} className="flex items-center justify-between gap-4 p-5">
                      <span className="flex items-center gap-3">
                        <DotGlyph seed={c.ticker} status="distressed" size={36} />
                        <span className="font-semibold">{c.name}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-mono">{sol(b.amountSol, 0)}</span>
                        <span className="rounded-full bg-lime-soft px-2.5 py-1 font-mono text-[11px] text-lime-text">TOP BID</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4" aria-label="How receivership works">
          <div className="rounded-card border border-line bg-surface p-6">
            <p className="label">How a rescue works</p>
            <ol className="mt-5 grid gap-5">
              {steps.map((s, i) => (
                <li key={s.t} className="grid grid-cols-[22px_1fr] gap-3">
                  <span className={`mt-1.5 size-2.5 rounded-full ${i === 0 ? 'bg-red' : i === 1 ? 'border-[1.5px] border-ink-3' : 'bg-lime'}`} />
                  <span>
                    <span className="block font-semibold">{s.t}</span>
                    <span className="mt-1 block text-[14px] text-ink-2">{s.b}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-card border border-line bg-surface p-6">
            <p className="label">Rescue capital</p>
            <p className="mt-3 font-mono text-[32px] leading-none font-medium tracking-[-0.03em]">{sol(networkStats.rescueCapitalSol, 0)}</p>
            <p className="mt-3 text-[14px] text-ink-2">Committed by bidders who haven’t picked a company yet. Big rescues often attract co-bidders.</p>
          </div>
        </aside>
      </div>

      <BidDialog
        key={last ?? 'none'}
        open={Boolean(bidFor)}
        onClose={closeBid}
        company={last ? getCompany(last) : undefined}
        listing={listings.find((l) => l.companyId === last)}
        onSubmit={async (b) => {
          await wait(900)
          setMyBids((xs) => [...xs.filter((x) => x.companyId !== b.companyId), { companyId: b.companyId, amountSol: b.amountSol }])
        }}
      />
    </>
  )
}
