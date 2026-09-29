import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

/** Designed empty / error states: three dots, one of them saying what happened. */
export function Notice({
  kind,
  title,
  body,
  action,
  onAction,
  children,
  className,
}: {
  kind: 'empty' | 'error'
  title: string
  body?: string
  action?: string
  onAction?: () => void
  children?: ReactNode
  className?: string
}) {
  return (
    <div role={kind === 'error' ? 'alert' : undefined} className={cn('flex flex-col items-center rounded-card border border-dashed border-line-2 px-6 py-14 text-center', className)}>
      <span aria-hidden className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-[var(--dot-dim)]" />
        <span className={cn('size-2.5 rounded-full', kind === 'error' ? 'bg-red' : 'border-[1.5px] border-ink-3')} />
        <span className="size-2.5 rounded-full bg-[var(--dot-dim)]" />
      </span>
      <p className="mt-5 text-[17px] font-semibold">{title}</p>
      {body && <p className="mt-1.5 max-w-[44ch] text-[15px] text-ink-2">{body}</p>}
      {children}
      {action && (
        <Button size="sm" className="mt-5" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  )
}
