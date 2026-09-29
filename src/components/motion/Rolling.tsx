import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { cn } from '@/lib/cn'
import { EASE_OUT } from '@/lib/motion'

/**
 * Characters that roll like a mechanical counter: each changed character slides in
 * from below when the number rises and from above when it falls. The rest stay still.
 */
export function Rolling({ value, text, className }: { value: number; text: string; className?: string }) {
  const [prev, setPrev] = useState(value)
  const [dir, setDir] = useState(1)
  if (value !== prev) {
    setPrev(value)
    setDir(value > prev ? 1 : -1)
  }
  return (
    <span className={cn('relative inline-flex overflow-hidden tabular', className)}>
      <span className="sr-only">{text}</span>
      {text.split('').map((ch, i) => (
        <span key={`${text.length}-${i}`} aria-hidden className="relative inline-block whitespace-pre">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={ch}
              className="inline-block"
              initial={{ y: `${dir * 90}%`, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: `${dir * -90}%`, opacity: 0 }}
              transition={{ duration: 0.38, ease: EASE_OUT }}
            >
              {ch}
            </m.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
