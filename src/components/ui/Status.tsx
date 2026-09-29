import type { CompanyStatus } from '@/types'
import { cn } from '@/lib/cn'
import { statusLabel } from '@/lib/format'

/** A company's state as a dot + word. Lime alive, hollow paused, red in receivership. */
export function StatusDot({ status, className }: { status: CompanyStatus; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        status === 'active' && 'bg-lime shadow-[0_0_0_3px_var(--lime-soft)]',
        status === 'paused' && 'border-[1.5px] border-ink-3',
        status === 'distressed' && 'bg-red shadow-[0_0_0_3px_var(--red-soft)]',
        className,
      )}
    />
  )
}

export function Status({ status, className }: { status: CompanyStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[13px] font-medium whitespace-nowrap',
        status === 'active' && 'text-lime-text',
        status === 'paused' && 'text-ink-3',
        status === 'distressed' && 'text-red',
        className,
      )}
    >
      <StatusDot status={status} />
      {statusLabel[status]}
    </span>
  )
}
