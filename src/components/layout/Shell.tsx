import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { m } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'
import { Footer } from './Footer'
import { Header } from './Header'
import { WalletCtx } from './wallet'

export function Shell() {
  const { pathname } = useLocation()
  // NORA: replace with the Solana wallet adapter.
  const [address, setAddress] = useState<string | null>(null)
  const connect = () => setAddress((a) => (a ? null : '7xKp…w3Qd'))

  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <WalletCtx.Provider value={{ address, connect }}>
      <a href="#main" className="sr-only z-50 rounded-full bg-lime px-4 py-2 text-on-lime focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Header />
      <main id="main">
        {/* each page fades up on arrival; no exit wait, so navigation never feels slow */}
        <m.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE_OUT }}>
          <Suspense fallback={<div className="min-h-[70svh]" />}>
            <Outlet />
          </Suspense>
        </m.div>
      </main>
      <Footer variant={pathname === '/' ? 'full' : 'compact'} />
    </WalletCtx.Provider>
  )
}
