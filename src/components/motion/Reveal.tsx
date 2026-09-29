import type { ReactNode } from 'react'
import { m, type Variants } from 'motion/react'
import { EASE_OUT, VIEWPORT } from '@/lib/motion'

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Children marked <Item> arrive in reading order. Above the fold use `immediate`. */
export function Stagger({ children, className, gap = 0.07, delay = 0.04, immediate = false, as = 'div' }: { children: ReactNode; className?: string; gap?: number; delay?: number; immediate?: boolean; as?: 'div' | 'ol' | 'ul' | 'dl' }) {
  const M = m[as]
  return (
    <M
      className={className}
      initial="hidden"
      {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: VIEWPORT })}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </M>
  )
}

export function Item({ children, className, as = 'div' }: { children?: ReactNode; className?: string; as?: 'div' | 'li' | 'p' | 'span' }) {
  const M = m[as]
  return (
    <M className={className} variants={item}>
      {children}
    </M>
  )
}

/** One block that rises in when scrolled into view (or right away with `immediate`). */
export function Reveal({ children, className, delay = 0, immediate = false }: { children: ReactNode; className?: string; delay?: number; immediate?: boolean }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      {...(immediate ? { animate: { opacity: 1, y: 0 } } : { whileInView: { opacity: 1, y: 0 }, viewport: VIEWPORT })}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </m.div>
  )
}
