import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Item, Stagger } from '@/components/motion/Reveal'

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
    <Stagger className={cn('flex flex-col gap-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        {label && <Item as="p" className="label">{label}</Item>}
        <Item>
          <h2 id={id} className={cn('text-h2 font-semibold', label && 'mt-4')}>
            {title}
          </h2>
        </Item>
        {sub && <Item as="p" className="mt-4 max-w-[58ch] text-lead text-ink-2">{sub}</Item>}
      </div>
      {action && <Item className="shrink-0">{action}</Item>}
    </Stagger>
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
