import { cn } from '@/lib/cn'
import { sol } from '@/lib/format'
import { useHoldcoTreasury } from '@/lib/live'
import { Rolling } from '@/components/motion/Rolling'

/**
 * The holdco's treasury, live: it ticks up each time a fee pulse in the Field arrives.
 * NORA: simulated from sample fees; subscribe to the holdco account when wired.
 */
export function HoldcoTicker({ className }: { className?: string }) {
  const v = useHoldcoTreasury()
  return (
    <p className={cn('flex items-center gap-2.5 font-mono text-[12px] text-ink-3', className)}>
      <span className="live-dot size-1.5 rounded-full bg-lime text-lime" aria-hidden />
      <span>Holdco treasury</span>
      <Rolling value={v} text={sol(v, 3)} className="text-ink" />
    </p>
  )
}
