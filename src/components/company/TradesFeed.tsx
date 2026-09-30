import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react'
import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { ago, sol } from '@/lib/format'
import { makeTrade, sampleTrades, type Trade } from '@/lib/market'
import { sampleNowMs, useNow } from '@/lib/live'
import { EASE_OUT } from '@/lib/motion'

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/**
 * Recent trades, newest first. While it's on screen, new trades arrive at the top: busier
 * coins more often, failing ones mostly selling. Sample activity until wired to the pool.
 */
export function TradesFeed({ company: c }: { company: Company }) {
  const now = useNow()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = useReducedMotion()
  const [trades, setTrades] = useState<Trade[]>(() => sampleTrades(c, sampleNowMs()))

  useEffect(() => {
    if (!inView || reduced) return
    let n = 0
    let t: number
    const tick = () => {
      n += 1
      if (!document.hidden) setTrades((ts) => [{ ...makeTrade(c, Math.random, sampleNowMs(), `${c.id}-live-${Date.now()}-${n}`), fresh: true }, ...ts].slice(0, 10))
      t = window.setTimeout(tick, (c.status === 'active' ? 2200 : 5200) + Math.random() * 2600)
    }
    t = window.setTimeout(tick, 1500)
    return () => window.clearTimeout(t)
  }, [inView, reduced, c])

  return (
    <div ref={ref}>
      <div className="grid grid-cols-[64px_minmax(0,1fr)_auto_64px] gap-3 border-b border-line px-5 py-2.5 sm:px-6">
        {['Side', 'Wallet', 'Amount', ''].map((h) => (
          <span key={h} className={cn('label', h === 'Amount' && 'text-right')}>
            {h}
          </span>
        ))}
      </div>
      <ol aria-live="off" className="h-[372px] overflow-hidden">
        <AnimatePresence initial={false}>
          {trades.map((t) => (
            <m.li
              key={t.id}
              layout="position"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              style={t.fresh ? ({ '--flash': t.side === 'buy' ? 'var(--lime-soft)' : 'var(--red-soft)' } as CSSProperties) : undefined}
              className={cn(t.fresh && 'flash', 'grid grid-cols-[64px_minmax(0,1fr)_auto_64px] items-center gap-3 border-b border-line px-5 py-2.5 text-[14px] sm:px-6')}
            >
              <span className={cn('flex items-center gap-2 font-medium', t.side === 'buy' ? 'text-lime-text' : 'text-red')}>
                <span className={cn('size-2 rounded-full', t.side === 'buy' ? 'bg-alive' : 'bg-red')} />
                {t.side === 'buy' ? 'Buy' : 'Sell'}
              </span>
              <span className="truncate font-mono text-[12px] text-ink-3">{t.wallet}</span>
              <span className="text-right">
                <span className="block font-mono tabular">{sol(t.sol, 2)}</span>
                <span className="block font-mono text-[11px] text-ink-4">
                  {compact.format(t.tokens)} ${c.ticker}
                </span>
              </span>
              <span className="text-right font-mono text-[11px] text-ink-4">{ago(new Date(t.at).toISOString(), now)}</span>
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  )
}
