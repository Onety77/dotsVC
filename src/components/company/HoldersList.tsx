import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { count } from '@/lib/format'
import { sampleHolders } from '@/lib/market'
import { DotBar } from '@/components/dots/DotBar'

/** The ten largest holders, each share drawn in dots. Protocol accounts are named. */
export function HoldersList({ company: c }: { company: Company }) {
  const holders = sampleHolders(c)
  const max = holders[0].share
  const top10 = holders.reduce((a, h) => a + h.share, 0)
  return (
    <div>
      <ol className="h-[372px] overflow-y-auto">
        {holders.map((h, i) => (
          <li key={h.wallet} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-5 py-2.5 text-[14px] sm:grid-cols-[22px_minmax(0,1fr)_auto_auto] sm:px-6">
            <span className="font-mono text-[11px] text-ink-4">{i + 1}</span>
            <span className="min-w-0">
              <span className={cn('block truncate', h.label ? 'font-medium' : 'font-mono text-[12px] text-ink-2')}>{h.label ?? h.wallet}</span>
              {h.label && <span className="block font-mono text-[11px] text-ink-4">{h.wallet}</span>}
            </span>
            <DotBar value={h.share} max={max} dots={14} tone={h.label === 'Company treasury' ? 'alive' : 'ink'} className="max-sm:hidden" />
            <span className="w-14 text-right font-mono tabular">{(h.share * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ol>
      <p className="px-5 py-3 text-[12px] text-ink-3 sm:px-6">
        {count(c.holders)} holders · the top ten hold {(top10 * 100).toFixed(0)}%
      </p>
    </div>
  )
}
