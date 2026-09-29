import { cn } from '@/lib/cn'
import { critical } from '@/lib/format'

/**
 * Runway you can count: one dot per week the treasury lasts at today's burn.
 * Filled dots are weeks left; the rest of the row is the scale. Under three weeks it turns red.
 */
export function RunwayDots({
  days,
  weeks = 14,
  size = 'md',
  className,
}: {
  days: number
  weeks?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const left = Math.min(weeks, Math.ceil(days / 7))
  const red = critical(days)
  const d = size === 'lg' ? 'size-2.5' : size === 'md' ? 'size-[7px]' : 'size-[5px]'
  const gap = size === 'lg' ? 'gap-1.5' : size === 'md' ? 'gap-1' : 'gap-[3px]'
  return (
    <span role="img" aria-label={`${days} days of runway`} className={cn('inline-flex items-center', gap, className)}>
      {Array.from({ length: weeks }, (_, i) => (
        <span
          key={i}
          className={cn(
            'shrink-0 rounded-full',
            d,
            i < left ? (red ? 'bg-red' : 'bg-ink') : 'bg-[var(--dot-dim)]',
          )}
        />
      ))}
    </span>
  )
}
