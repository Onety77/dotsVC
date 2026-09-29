import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'

/**
 * The DOTS mark: four dots, one alive. It turns a quarter each time you move through the
 * network (every navigation) and when you point at it, so the live dot visits each corner.
 */
export function LogoMark({ className, turns = 0 }: { className?: string; turns?: number }) {
  return (
    <m.svg viewBox="0 0 24 24" className={cn('size-6', className)} aria-hidden initial={false} animate={{ rotate: turns * 90 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
      <circle cx="7" cy="7" r="3.6" fill="var(--ink)" />
      <circle cx="17" cy="7" r="3.6" fill="var(--ink)" />
      <circle cx="7" cy="17" r="3.6" fill="var(--ink)" />
      <circle cx="17" cy="17" r="3.6" fill="var(--lime)" />
    </m.svg>
  )
}

export function Logo({ className, lively = false }: { className?: string; lively?: boolean }) {
  const { pathname } = useLocation()
  const [turns, setTurns] = useState(0)
  const [path, setPath] = useState(pathname)
  if (lively && path !== pathname) {
    setPath(pathname)
    setTurns((t) => t + 1)
  }
  return (
    <span className={cn('inline-flex items-center gap-2', className)} onMouseEnter={lively ? () => setTurns((t) => t + 1) : undefined}>
      <LogoMark turns={turns} />
      <span className="text-[19px] font-bold tracking-[-0.04em]">dots</span>
    </span>
  )
}
