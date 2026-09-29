import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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
        <Outlet />
      </main>
      <Footer variant={pathname === '/' ? 'full' : 'compact'} />
    </WalletCtx.Provider>
  )
}
