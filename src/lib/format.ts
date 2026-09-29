import type { CompanyStatus } from '@/types'

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** $1.2M, $284K, $920 */
export const usd = (n: number) => (n >= 1000 ? `$${compact.format(n)}` : `$${n.toFixed(0)}`)
/** Prices keep precision: $0.01423, $1.82 */
export const price = (n: number) => `$${n < 1 ? n.toPrecision(3) : n.toFixed(2)}`
export const sol = (n: number, d = 1) => `${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })} SOL`
export const count = (n: number) => n.toLocaleString('en-US')
export const pct = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`

const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
export const day = (iso: string) => dayFmt.format(new Date(iso))

/** Time left until `iso`, as 1d 12:21:03 or 02:14:32. `now` fixed for sample data. */
export function countdown(iso: string, now: number) {
  let s = Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000))
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${d ? `${d}d ` : ''}${hh}:${mm}:${ss}`
}

export function ago(iso: string, now: number) {
  const m = Math.round((now - new Date(iso).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export const statusLabel: Record<CompanyStatus, string> = { active: 'Active', paused: 'Paused', distressed: 'In receivership' }

/** Runway is critical below three weeks. */
export const critical = (days: number) => days < 21
