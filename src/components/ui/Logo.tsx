import { cn } from '@/lib/cn'

/** The DOTS mark: four dots, one alive. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', className)} aria-hidden>
      <circle cx="7" cy="7" r="3.6" fill="var(--ink)" />
      <circle cx="17" cy="7" r="3.6" fill="var(--ink)" />
      <circle cx="7" cy="17" r="3.6" fill="var(--ink)" />
      <circle cx="17" cy="17" r="3.6" fill="var(--lime)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-[19px] font-bold tracking-[-0.04em]">dots</span>
    </span>
  )
}
