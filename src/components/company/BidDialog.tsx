import { useState } from 'react'
import type { Company, Listing } from '@/types'
import { sol } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { useWallet } from '@/components/layout/wallet'

const agentOptions = [
  { id: 'bring', label: 'Bring my own agent', note: 'Configure it after the auction settles.' },
  { id: 'dots', label: 'Use a DOTS agent', note: 'A fresh agent with your mission.' },
  { id: 'keep', label: 'Keep the current agent', note: 'Only if it wasn’t suspended.' },
] as const

/**
 * A rescue bid: an amount and a plan. The plan is public with the bid, because
 * holders should know what the new owner intends.
 * NORA: `onSubmit` should sign and send the bid to the auction program.
 */
export function BidDialog({
  open,
  onClose,
  company,
  listing,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  company?: Company
  listing?: Listing
  onSubmit: (bid: { companyId: string; amountSol: number; plan: string; agent: string }) => Promise<void>
}) {
  const { address, connect } = useWallet()
  const min = listing ? Math.max(listing.reservePriceSol, (listing.topBidSol ?? 0) + 1) : 0
  const [amount, setAmount] = useState(String(min))
  const [plan, setPlan] = useState('')
  const [agent, setAgent] = useState<string>('bring')
  const [errors, setErrors] = useState<{ amount?: string; plan?: string }>({})
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form')

  if (!company || !listing) return null

  const submit = async () => {
    const n = Number(amount)
    const e: typeof errors = {}
    if (!Number.isFinite(n) || n < min) e.amount = `Bids start at ${sol(min, 0)}.`
    if (plan.trim().length < 20) e.plan = 'Tell holders what you’ll do with it (a sentence or two).'
    setErrors(e)
    if (Object.keys(e).length) return
    setPhase('sending')
    await onSubmit({ companyId: company.id, amountSol: n, plan: plan.trim(), agent })
    setPhase('done')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={phase === 'done' ? 'Bid placed' : `Rescue ${company.name}`}
      description={phase === 'done' ? undefined : 'Win the auction and the company is yours: treasury, community and brand.'}
      footer={
        phase === 'done' ? (
          <Button variant="primary" className="w-full" onClick={onClose}>
            Done
          </Button>
        ) : !address ? (
          <Button variant="primary" className="w-full" onClick={connect}>
            Connect wallet to bid
          </Button>
        ) : (
          <Button variant="primary" className="w-full" onClick={submit} disabled={phase === 'sending'}>
            {phase === 'sending' ? 'Waiting for signature…' : `Place bid of ${sol(Number(amount) || 0, 0)}`}
          </Button>
        )
      }
    >
      {phase === 'done' ? (
        <div className="flex flex-col items-center py-6 text-center">
          <DotGlyph seed={company.ticker} status="active" size={64} />
          <p className="mt-5 text-[17px] font-semibold">You’re the top bidder for {company.name}.</p>
          <p className="mt-1.5 max-w-[40ch] text-[15px] text-ink-2">We’ll tell you if you’re outbid. If you win, the company leaves receivership with you as its new owner.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          <div className="flex items-center gap-3 rounded-[14px] border border-line p-3">
            <DotGlyph seed={company.ticker} status="distressed" size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{company.name}</p>
              <p className="truncate text-[13px] text-ink-3">{listing.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-ink-3">{listing.topBidSol ? 'Top bid' : 'Reserve'}</p>
              <p className="font-mono text-sm">{sol(listing.topBidSol ?? listing.reservePriceSol, 0)}</p>
            </div>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Your bid</span>
            <span className={`flex h-12 items-center rounded-[14px] border px-4 focus-within:border-ink-3 ${errors.amount ? 'border-red' : 'border-line-2'}`}>
              <input
                data-autofocus
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                className="min-w-0 flex-1 bg-transparent font-mono text-lg outline-none"
                aria-invalid={Boolean(errors.amount) || undefined}
              />
              <span className="font-mono text-sm text-ink-3">SOL</span>
            </span>
            <span className={`text-[12px] ${errors.amount ? 'text-red' : 'text-ink-3'}`}>{errors.amount ?? `Minimum ${sol(min, 0)}. Funds are escrowed until the auction ends.`}</span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Your plan</span>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={3}
              placeholder="e.g. Cut burn by half, relaunch as a fishing game, bring back the old community mods."
              className={`resize-none rounded-[14px] border bg-transparent px-4 py-3 text-base outline-none focus:border-ink-3 sm:text-[15px] ${errors.plan ? 'border-red' : 'border-line-2'}`}
              aria-invalid={Boolean(errors.plan) || undefined}
            />
            <span className={`text-[12px] ${errors.plan ? 'text-red' : 'text-ink-3'}`}>{errors.plan ?? 'Shown publicly with your bid.'}</span>
          </label>

          <fieldset className="min-w-0">
            <legend className="mb-2 text-sm font-medium">Who runs it</legend>
            <div className="grid gap-2">
              {agentOptions.map((o) => (
                <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-[14px] border p-3 ${agent === o.id ? 'border-ink' : 'border-line hover-device:hover:border-line-2'}`}>
                  <input type="radio" name="agent" value={o.id} checked={agent === o.id} onChange={() => setAgent(o.id)} className="mt-1 accent-[var(--ink)]" />
                  <span>
                    <span className="block text-[15px] font-medium">{o.label}</span>
                    <span className="block text-[13px] text-ink-3">{o.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </Dialog>
  )
}
