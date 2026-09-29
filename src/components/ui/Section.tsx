import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** One section-head pattern everywhere: mono label, headline, optional sub and action. */
export function SectionHead({
  label,
  title,
  sub,
  action,
  id,
  className,
}: {
  label?: string
  title: ReactNode
  sub?: ReactNode
  action?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        {label && <p className="label">{label}</p>}
        <h2 id={id} className={cn('text-h2 font-semibold', label && 'mt-4')}>
          {title}
        </h2>
        {sub && <p className="mt-4 max-w-[58ch] text-lead text-ink-2">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Section({ children, className, labelledBy, id }: { children: ReactNode; className?: string; labelledBy?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('border-t border-line py-20 lg:py-28', className)}>
      <div className="wrap">{children}</div>
    </section>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-card border border-line bg-surface', className)}>{children}</div>
}
