import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const box = 'rounded-[14px] border bg-transparent px-4 text-base outline-none transition-colors focus:border-ink-3 sm:text-[15px]'

export function TextField({ label, hint, error, prefix, className, ...rest }: { label: string; hint?: string; error?: string; prefix?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={cn('grid min-w-0 gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className={cn('flex h-12 items-center', box, error ? 'border-red' : 'border-line-2', 'focus-within:border-ink-3')}>
        {prefix && <span className="mr-1 font-mono text-ink-4">{prefix}</span>}
        <input id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={`${id}-d`} className="h-full min-w-0 flex-1 bg-transparent outline-none" {...rest} />
      </div>
      {(error || hint) && (
        <p id={`${id}-d`} className={cn('text-[12px]', error ? 'text-red' : 'text-ink-3')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export function TextArea({ label, hint, error, className, ...rest }: { label: string; hint?: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div className={cn('grid min-w-0 gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={`${id}-d`} className={cn(box, 'resize-none py-3', error ? 'border-red' : 'border-line-2')} {...rest} />
      {(error || hint) && (
        <p id={`${id}-d`} className={cn('text-[12px]', error ? 'text-red' : 'text-ink-3')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
