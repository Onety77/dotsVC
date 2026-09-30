import { Link } from 'react-router-dom'
import { companies, bids, listings } from '@/data/network'
import { cn } from '@/lib/cn'
import { ago, sol } from '@/lib/format'
import { useNow } from '@/lib/live'

interface Event {
  id: string
  at: number
  tone: 'alive' | 'red' | 'ink'
  to: string
  name: string
  text: string
}

/** What just happened across the network: agents at work, bids, launches, companies failing. */
function events(): Event[] {
  const out: Event[] = []
  for (const c of companies) {
    const last = c.agent.log[0]
    if (c.status === 'active' && last) out.push({ id: `${c.id}-log`, at: Date.parse(last.at), tone: 'alive', to: `/company/${c.id}`, name: `${c.name}’s agent`, text: last.text.charAt(0).toLowerCase() + last.text.slice(1) })
  }
  for (const l of listings) {
    const c = companies.find((x) => x.id === l.companyId)!
    out.push({ id: `${c.id}-fail`, at: Date.parse(c.timeline[c.timeline.length - 1]?.at ?? c.launchedAt), tone: 'red', to: `/receivership/${c.id}`, name: c.name, text: `entered receivership: ${l.reason.toLowerCase()}` })
  }
  for (const b of bids.slice(0, 6)) {
    const c = companies.find((x) => x.id === b.companyId)!
    out.push({ id: b.id, at: Date.parse(b.at), tone: 'ink', to: `/receivership/${c.id}`, name: b.bidder, text: `bid ${sol(b.amountSol, 0)} to rescue ${c.name}` })
  }
  const newest = [...companies].sort((a, b) => Date.parse(b.launchedAt) - Date.parse(a.launchedAt)).slice(0, 2)
  for (const c of newest) out.push({ id: `${c.id}-new`, at: Date.parse(c.launchedAt), tone: 'alive', to: `/company/${c.id}`, name: `$${c.ticker}`, text: 'launched and joined the network' })
  // interleave the kinds (agent work, failures, bids, launches), newest first within each
  const byKind = new Map<string, Event[]>()
  for (const e of out.sort((a, b) => b.at - a.at)) {
    const k = e.id.split('-').pop()!.replace(/^b\d+$/, 'bid')
    byKind.set(k, [...(byKind.get(k) ?? []), e])
  }
  const lanes = [...byKind.values()]
  const mixed: Event[] = []
  for (let i = 0; mixed.length < out.length; i++) for (const lane of lanes) if (lane[i]) mixed.push(lane[i])
  return mixed
}

const feed = events()

/**
 * A slow ticker of network activity under the hero. It pauses while you point at it or tab
 * through it, and sits still (scrollable) under reduced motion.
 */
export function ActivityStrip() {
  const now = useNow()
  const item = (e: Event, copy: number) => (
    <li key={`${copy}-${e.id}`} aria-hidden={copy === 1 || undefined} className="shrink-0">
      <Link to={e.to} tabIndex={copy === 1 ? -1 : undefined} className="flex items-center gap-2.5 rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors hover-device:hover:bg-hover">
        <span className={cn('size-1.5 rounded-full', e.tone === 'alive' ? 'bg-alive' : e.tone === 'red' ? 'bg-red' : 'bg-ink-3')} />
        <span className="font-medium">{e.name}</span>
        <span className="text-ink-2">{e.text}</span>
        <span className="font-mono text-[11px] text-ink-4">{ago(new Date(e.at).toISOString(), now)}</span>
      </Link>
    </li>
  )
  return (
    <section aria-label="Latest across the network" className="border-t border-line">
      <div className="ticker relative flex items-center overflow-hidden py-2.5 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <span className="sr-only">Latest across the network</span>
        <ul className="ticker-track flex w-max gap-2">
          {feed.map((e) => item(e, 0))}
          {feed.map((e) => item(e, 1))}
        </ul>
      </div>
    </section>
  )
}
