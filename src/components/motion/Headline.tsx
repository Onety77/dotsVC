import type { ReactNode } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { EASE_OUT, SPRING_POP, VIEWPORT } from '@/lib/motion'

/** A headline line that slides up from behind a mask. Padding keeps descenders inside the mask. */
export function MaskLine({ children, delay = 0, inView = false, className }: { children: ReactNode; delay?: number; inView?: boolean; className?: string }) {
  const to = { y: '0%' }
  return (
    <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
      <m.span
        className={cn('block', className)}
        initial={{ y: '108%' }}
        {...(inView ? { whileInView: to, viewport: VIEWPORT } : { animate: to })}
        transition={{ duration: 0.95, delay, ease: EASE_OUT }}
      >
        {children}
      </m.span>
    </span>
  )
}

/**
 * The full stop is a dot: it drops in once the sentence has landed, with a small bounce.
 * Screen readers still get a period.
 */
export function DotPeriod({ delay = 0, inView = false, className }: { delay?: number; inView?: boolean; className?: string }) {
  const to = { y: '0em', scale: 1, opacity: 1 }
  return (
    <>
      <span className="sr-only">.</span>
      <m.span
        aria-hidden
        className={cn('ml-[0.05em] inline-block size-[0.17em] rounded-full bg-lime', className)}
        initial={{ y: '-0.9em', scale: 0.4, opacity: 0 }}
        {...(inView ? { whileInView: to, viewport: VIEWPORT } : { animate: to })}
        transition={{ ...SPRING_POP, delay, opacity: { duration: 0.15, delay } }}
      />
    </>
  )
}
