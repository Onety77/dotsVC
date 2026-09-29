import { cn } from '@/lib/cn'
import { countdown } from '@/lib/format'
import { useNow } from '@/lib/live'
import { Rolling } from './Rolling'

/** An auction clock that ticks, digit by digit. Red in the last six hours. */
export function Countdown({ to, className, urgentClass = 'text-red' }: { to: string; className?: string; urgentClass?: string }) {
  const now = useNow()
  const left = new Date(to).getTime() - now
  return <Rolling value={-left} text={countdown(to, now)} className={cn('font-mono tabular', left < 6 * 3600_000 && urgentClass, className)} />
}
