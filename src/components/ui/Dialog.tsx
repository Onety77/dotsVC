import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Modal: centred on desktop, a bottom sheet on phones.
 * Esc and the backdrop close it; focus is trapped inside and returned afterwards.
 */
export function Dialog({ open, onClose, title, description, children, footer }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => (panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus(), 20)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault()
        items[items.length - 1].focus()
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault()
        items[0].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        className={cn('relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[22px] border border-line bg-surface shadow-card sm:max-w-[560px] sm:rounded-card')}
      >
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-t`} className="text-[20px] font-semibold tracking-[-0.02em]">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="-mt-1 -mr-2 grid size-9 place-items-center rounded-full text-ink-3 hover-device:hover:bg-hover hover-device:hover:text-ink">
            <X className="size-[18px]" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
