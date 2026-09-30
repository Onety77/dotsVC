import { useId, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { EASE_OUT, SPRING_UI } from '@/lib/motion'
import { PriceChart } from './PriceChart'
import { TradesFeed } from './TradesFeed'
import { HoldersList } from './HoldersList'

const TABS = [
  { id: 'chart', label: 'Chart' },
  { id: 'trades', label: 'Trades' },
  { id: 'holders', label: 'Holders' },
] as const
type Tab = (typeof TABS)[number]['id']

/** The coin's market in one card: price, the live trade feed, and who holds it. */
export function MarketCard({ company, className }: { company: Company; className?: string }) {
  const [tab, setTab] = useState<Tab>('chart')
  const id = useId()
  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <div role="tablist" aria-label="Market" className="flex gap-1 border-b border-line px-3 pt-2 sm:px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`${id}-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`${id}-panel`}
            onClick={() => setTab(t.id)}
            className={cn('relative px-3 pt-2 pb-3 text-sm font-medium transition-colors', tab === t.id ? 'text-ink' : 'text-ink-3 hover-device:hover:text-ink')}
          >
            {t.label}
            {tab === t.id && <m.span layoutId={`${id}-bar`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" transition={SPRING_UI} />}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="min-h-[412px]">
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.3, ease: EASE_OUT }}>
            {tab === 'chart' ? <PriceChart company={company} bare /> : tab === 'trades' ? <TradesFeed company={company} /> : <HoldersList company={company} />}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
