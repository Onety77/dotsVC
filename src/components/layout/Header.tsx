import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { EASE_OUT, SPRING_UI } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { docsUrl, nav } from './nav'
import { ThemeSwitch } from './ThemeSwitch'
import { useWallet } from './wallet'

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { address, connect } = useWallet()

  // close the menu on navigation; lock scroll while it's open
  const [path, setPath] = useState(pathname)
  if (path !== pathname) {
    setPath(pathname)
    setOpen(false)
  }
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md">
      <div className="wrap flex h-16 items-center gap-8">
        <Link to="/" aria-label="DotCo home" className="rounded-md">
          <Logo lively />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) => cn('relative flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors', isActive ? 'text-ink' : 'text-ink-2 hover-device:hover:text-ink')}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <m.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-hover" transition={SPRING_UI} />}
                      <span className="relative">{n.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <li>
              <a href={docsUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1 rounded-full px-3.5 text-sm font-medium text-ink-2 transition-colors hover-device:hover:text-ink">
                Docs <ArrowUpRight className="size-3.5" />
              </a>
            </li>
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch className="hidden sm:flex" />
          <Button variant={address ? 'secondary' : 'primary'} size="md" onClick={connect} className="max-sm:hidden">
            {address ? <span className="font-mono text-[13px]">{address}</span> : 'Connect wallet'}
          </Button>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full border border-line-2 md:hidden"
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
      {open && (
        <m.div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-bg md:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <nav aria-label="Main" className="wrap flex-1 pt-6">
            <ul className="flex flex-col">
              {[{ to: '/', label: 'Home' }, ...nav].map((n, i) => (
                <m.li key={n.to} className="border-b border-line" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 + i * 0.05, ease: EASE_OUT }}>
                  <NavLink to={n.to} end className={({ isActive }) => cn('flex h-16 items-center justify-between font-display text-[28px] font-semibold tracking-[-0.03em]', !isActive && 'text-ink-2')}>
                    {({ isActive }) => (
                      <>
                        {n.label}
                        {isActive && <span className="size-2.5 rounded-full bg-alive" />}
                      </>
                    )}
                  </NavLink>
                </m.li>
              ))}
              <li className="border-b border-line">
                <a href={docsUrl} target="_blank" rel="noreferrer" className="flex h-16 items-center gap-2 font-display text-[28px] font-semibold tracking-[-0.03em] text-ink-2">
                  Docs <ArrowUpRight className="size-5" />
                </a>
              </li>
            </ul>
          </nav>
          <div className="wrap flex items-center justify-between gap-3 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
            <ThemeSwitch />
            <Button variant={address ? 'secondary' : 'primary'} size="lg" onClick={connect} className="flex-1">
              {address ? <span className="font-mono text-[13px]">{address}</span> : 'Connect wallet'}
            </Button>
          </div>
        </m.div>
      )}
      </AnimatePresence>
    </header>
  )
}
