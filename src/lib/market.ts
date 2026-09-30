import type { Company } from '@/types'
import { seeded } from './seeded'

/*
  Sample market activity, generated from each company's own numbers so it stays consistent
  between visits: the same holders every time, and a trade feed that matches its volume.
*/

export const SOL_USD = 150

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const wallet = (r: () => number) => {
  const pick = () => B58[Math.floor(r() * B58.length)]
  return `${pick()}${pick()}${pick()}${pick()}…${pick()}${pick()}${pick()}${pick()}`
}

export interface Trade {
  id: string
  side: 'buy' | 'sell'
  sol: number
  tokens: number
  wallet: string
  at: number
  /** arrived while you were watching */
  fresh?: boolean
}

/** How strongly a company's trades lean to buying: healthy companies are bought, failing ones sold. */
const buyBias = (c: Company) => (c.status === 'distressed' ? 0.3 : c.status === 'paused' ? 0.45 : 0.5 + Math.min(c.change24h, 0.3))

export function makeTrade(c: Company, r: () => number, at: number, id: string): Trade {
  const typical = c.volume24hUsd / SOL_USD / 400
  const sol = Math.max(0.05, typical * (0.15 + r() ** 2 * 3))
  return { id, side: r() < buyBias(c) ? 'buy' : 'sell', sol, tokens: (sol * SOL_USD) / c.priceUsd, wallet: wallet(r), at }
}

/** The most recent trades, newest first. */
export function sampleTrades(c: Company, now: number, n = 10): Trade[] {
  const r = seeded(`${c.id}-trades`)
  // busier coins trade more often
  const gap = Math.max(20, 3_600_000 / Math.max(1, c.volume24hUsd / SOL_USD / 60)) / 1000
  let t = now
  return Array.from({ length: n }, (_, i) => {
    t -= (0.3 + r() * 1.4) * gap * 1000
    return makeTrade(c, r, t, `${c.id}-t${i}`)
  })
}

export interface Holder {
  wallet: string
  label?: string
  share: number
}

/** The ten largest holders. Named accounts are the ones the protocol itself controls. */
export function sampleHolders(c: Company): Holder[] {
  const r = seeded(`${c.id}-holders`)
  const named: Holder[] = [
    { wallet: wallet(r), label: 'PumpSwap pool', share: 0.16 + r() * 0.1 },
    { wallet: wallet(r), label: 'Company treasury', share: 0.04 + r() * 0.04 },
    { wallet: wallet(r), label: 'Creator', share: 0.015 + r() * 0.025 },
    { wallet: wallet(r), label: 'DotCo holdco', share: 0.008 + r() * 0.006 },
  ]
  let s = 0.03 + r() * 0.02
  const whales = Array.from({ length: 6 }, () => {
    s *= 0.62 + r() * 0.25
    return { wallet: wallet(r), share: s }
  })
  return [...named, ...whales].sort((a, b) => b.share - a.share)
}

export interface Week {
  label: string
  inSol: number
  outSol: number
}

/**
 * Four weeks of money in (the treasury's share of creator fees) and out (the agent's spending).
 * Income is anchored to the burn so the story matches the runway: healthy companies earn a
 * little more than they spend, paused ones less, and failing ones dwindle to nothing.
 */
export function sampleWeeks(c: Company): Week[] {
  const r = seeded(`${c.id}-weeks`)
  const burnPerWeek = c.burnSolPerDay * 7
  const earn = c.status === 'active' ? 1.02 + Math.min(c.change24h, 0.2) : c.status === 'paused' ? 0.55 : 0.35
  return ['3 wks ago', '2 wks ago', 'Last week', 'This week'].map((label, i) => {
    const fade = c.status === 'distressed' ? 1 - i * 0.28 : 1
    return {
      label,
      inSol: burnPerWeek * earn * fade * (0.8 + r() * 0.4),
      outSol: c.status === 'distressed' && i === 3 ? 0 : burnPerWeek * (c.status === 'paused' && i >= 2 ? 0.25 : 0.85 + r() * 0.3),
    }
  })
}
