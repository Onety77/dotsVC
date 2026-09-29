import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Item, Stagger } from '@/components/motion/Reveal'

/** The top of every app page: label, title, description, actions, and an optional stats row. */
export function PageHeader({
  label,
  title,
  description,
  actions,
  children,
  className,
}: {
  label?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('border-b border-line', className)}>
      <Stagger immediate gap={0.06} className="wrap pt-10 pb-8 lg:pt-14 lg:pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {label && <Item className="label">{label}</Item>}
            <Item>
              <h1 className={cn('text-h1 font-semibold', label && 'mt-4')}>{title}</h1>
            </Item>
            {description && <Item as="p" className="mt-3 max-w-[60ch] text-lead text-ink-2">{description}</Item>}
          </div>
          {actions && <Item className="flex shrink-0 flex-wrap gap-2">{actions}</Item>}
        </div>
        {children && <Item>{children}</Item>}
      </Stagger>
    </div>
  )
}

/** A row of figures split by hairlines. */
export function Figures({ items, className }: { items: { k: string; v: ReactNode; tone?: 'red' | 'lime' }[]; className?: string }) {
  return (
    <dl className={cn('mt-10 grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:flex', className)}>
      {items.map((it, i) => (
        <div key={it.k} className={cn('min-w-0 py-5 pr-4 lg:flex-1 lg:border-l lg:border-line lg:px-6 lg:first:border-l-0 lg:first:pl-0', i % 2 === 1 && 'border-l border-line pl-4 sm:border-l-0 sm:pl-0', i >= 2 && 'border-t border-line sm:border-t-0')}>
          <dt className="text-[13px] text-ink-3">{it.k}</dt>
          <dd className={cn('mt-1.5 truncate font-mono text-[22px] font-medium tracking-[-0.02em] tabular', it.tone === 'red' && 'text-red', it.tone === 'lime' && 'text-lime-text')}>{it.v}</dd>
        </div>
      ))}
    </dl>
  )
}
