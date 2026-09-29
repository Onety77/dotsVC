import { useState } from 'react'
import { Search } from 'lucide-react'
import type { CompanyStatus } from '@/types'
import { companies, networkStats } from '@/data/network'
import { count, sol, usd } from '@/lib/format'
import { useHoldcoTreasury } from '@/lib/live'
import { CountUp } from '@/components/motion/CountUp'
import { Rolling } from '@/components/motion/Rolling'
import { useDemoState } from '@/lib/hooks'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { Figures, PageHeader } from '@/components/ui/PageHeader'
import { Segmented } from '@/components/ui/Segmented'
import { CompanyTable } from '@/components/company/CompanyTable'
import { FieldLegend, NetworkField } from '@/components/dots/NetworkField'

type Filter = 'all' | CompanyStatus
type Sort = 'runway' | 'fees' | 'mcap' | 'newest'

const sorters: Record<Sort, (a: (typeof companies)[number], b: (typeof companies)[number]) => number> = {
  runway: (a, b) => b.runwayDays - a.runwayDays,
  fees: (a, b) => b.fees30dUsd - a.fees30dUsd,
  mcap: (a, b) => b.marketCapUsd - a.marketCapUsd,
  newest: (a, b) => +new Date(b.launchedAt) - +new Date(a.launchedAt),
}

export function Network() {
  const state = useDemoState()
  // ticks as fee pulses in the map below reach the holdco
  const holdcoSol = useHoldcoTreasury()
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('runway')
  const [q, setQ] = useState('')

  const source = state === 'empty' ? [] : companies
  const n = (f: Filter) => (f === 'all' ? source.length : source.filter((c) => c.status === f).length)
  const needle = q.trim().toLowerCase().replace(/^\$/, '')
  const rows = source
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) => !needle || `${c.name} ${c.ticker}`.toLowerCase().includes(needle))
    .sort(sorters[sort])

  return (
    <>
      <PageHeader
        label="The network"
        title="DotCo Holdco"
        description="A holding company of meme companies. Each one is tied to the holdco until it runs out of runway."
        actions={
          <Button to="/launch" variant="primary" arrow>
            Launch a company
          </Button>
        }
      >
        <Figures
          items={[
            { k: 'Holdco treasury', v: <Rolling value={holdcoSol} text={sol(holdcoSol, 3)} /> },
            { k: 'Companies', v: <CountUp value={networkStats.companies} format={(n) => count(Math.round(n))} /> },
            { k: 'Creator fees, 30 days', v: <CountUp value={networkStats.fees30dUsd} format={usd} /> },
            { k: 'Average runway', v: <CountUp value={networkStats.avgRunwayDays} format={(n) => `${Math.round(n)} days`} /> },
            { k: 'In receivership', v: <CountUp value={networkStats.inReceivership} format={(n) => count(Math.round(n))} />, tone: 'red' },
          ]}
        />
      </PageHeader>

      <section aria-label="Network map" className="border-b border-line">
        <div className="wrap py-10 lg:py-12">
          {state === 'loading' ? (
            <div className="skeleton aspect-[1000/660] w-full" />
          ) : state === 'error' ? (
            <Notice kind="error" title="The network map didn’t load." body="The indexer didn’t answer. Nothing has changed on-chain." />
          ) : source.length === 0 ? (
            <Notice kind="empty" title="No companies yet." body="The first company launched through DotCo will appear here, tied to the holdco." />
          ) : (
            <>
              <NetworkField companies={source} />
              <FieldLegend className="mt-4 justify-center" />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="companies-title" className="wrap py-10 lg:py-14">
        <h2 id="companies-title" className="sr-only">
          Companies
        </h2>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented<Filter>
            label="Filter by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: n('all') },
              { value: 'active', label: 'Active', count: n('active') },
              { value: 'paused', label: 'Paused', count: n('paused') },
              { value: 'distressed', label: 'In receivership', count: n('distressed') },
            ]}
          />
          <div className="flex gap-2">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-line-2 px-4 focus-within:border-ink-3 lg:w-64 lg:flex-none">
              <Search className="size-4 text-ink-4" />
              <span className="sr-only">Search companies</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or $TICKER" className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm" />
            </label>
            <label className="relative">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 appearance-none rounded-full border border-line-2 bg-bg pr-9 pl-4 text-sm font-medium focus:border-ink-3 focus:outline-none"
              >
                <option value="runway">Longest runway</option>
                <option value="fees">Most fees</option>
                <option value="mcap">Market cap</option>
                <option value="newest">Newest</option>
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[10px] text-ink-3">
                ▼
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5">
          {state === 'loading' ? (
            <div className="grid gap-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-[72px]" />)}</div>
          ) : state === 'error' ? (
            <Notice kind="error" title="Companies didn’t load." body="Try again in a moment." />
          ) : rows.length === 0 ? (
            <Notice
              kind="empty"
              title={source.length === 0 ? 'No companies yet.' : q ? `Nothing matches “${q}”.` : 'None in this state right now.'}
              action={source.length ? 'Show all companies' : undefined}
              onAction={() => {
                setFilter('all')
                setQ('')
              }}
            />
          ) : (
            <CompanyTable companies={rows} />
          )}
        </div>
      </section>
    </>
  )
}
