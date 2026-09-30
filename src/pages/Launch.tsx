import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Check, ImagePlus } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import type { Company } from '@/types'
import { companies } from '@/data/network'
import { EASE_OUT, SPRING_POP } from '@/lib/motion'
import { DotsLoader } from '@/components/motion/DotsLoader'
import { DotGlyph } from '@/components/dots/DotGlyph'
import { NetworkField } from '@/components/dots/NetworkField'
import { cn } from '@/lib/cn'
import { sol } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { TextArea, TextField } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { CompanyPreview } from '@/components/launch/CompanyPreview'
import { routing, type LaunchDraft } from '@/lib/launch'
import { StepDots } from '@/components/launch/StepDots'
import { useWallet } from '@/components/layout/wallet'

const STEPS = ['Coin', 'Agent', 'Treasury', 'Review']
const MANDATE = ['Design', 'Development', 'Marketing', 'Exchange listings', 'Merch', 'Community']
const PRESETS = [
  'Grow the community and land two exchange listings.',
  'Ship one small product every week and keep holders fed.',
  'Build a game holders want to play, then sell merch around it.',
]
const BUDGETS = [0.5, 1, 2, 4]
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

const blank: LaunchDraft = { name: '', ticker: '', description: '', x: '', telegram: '', mission: '', agentName: '', mandate: ['Design', 'Marketing'], budgetSol: 1, initialBuySol: 0 }

const TX = ['Create the coin on Pump.fun', 'Create the company, its treasury and mandate', 'Hire the agent']

/** The company you just launched, as the network sees it. */
function newcomer(d: LaunchDraft): Company {
  const runway = Math.round(30 / d.budgetSol)
  return {
    ...companies[0],
    id: 'new',
    name: d.name,
    ticker: d.ticker,
    tagline: d.description,
    status: 'active',
    runwayDays: runway,
    treasurySol: 30,
    burnSolPerDay: d.budgetSol,
    fees30dUsd: 1,
    agent: { name: d.agentName || 'Agent', mission: d.mission, state: 'working', log: [] },
    jobs: [],
    artifacts: [],
    timeline: [],
    image: d.image,
  }
}

export function Launch() {
  const { address, connect } = useWallet()
  const [step, setStep] = useState(0)
  const [d, setD] = useState<LaunchDraft>(blank)
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(-1) // -1 not started, TX.length = done
  const patch = (p: Partial<LaunchDraft>) => setD((x) => ({ ...x, ...p }))
  // steps slide in the direction of travel
  const [shownStep, setShownStep] = useState(step)
  const [dir, setDir] = useState(1)
  if (step !== shownStep) {
    setDir(step > shownStep ? 1 : -1)
    setShownStep(step)
  }

  // release the preview URL when the image changes
  useEffect(() => () => (d.image ? URL.revokeObjectURL(d.image) : undefined), [d.image])

  const errors: Record<string, string> = {}
  if (step === 0) {
    if (!d.name.trim()) errors.name = 'Give the company a name.'
    if (!/^[A-Z0-9]{2,10}$/.test(d.ticker)) errors.ticker = '2–10 letters or numbers.'
  }
  if (step === 1) {
    if (d.mission.trim().length < 20) errors.mission = 'A sentence or two: what should the agent achieve?'
    if (d.mandate.length === 0) errors.mandate = 'Pick at least one thing it can spend on.'
  }
  const ok = Object.keys(errors).length === 0

  const next = () => {
    if (!ok) return setShow(true)
    setShow(false)
    setStep((s) => s + 1)
  }

  const launch = async () => {
    if (!address) return connect()
    for (let i = 0; i < TX.length; i++) {
      setProgress(i)
      await wait(900)
    }
    setProgress(TX.length)
  }

  const onImage = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) patch({ image: URL.createObjectURL(f) })
  }

  const done = progress === TX.length
  // bring the new company's arrival into view
  const birth = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(() => birth.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }), 350)
    return () => window.clearTimeout(t)
  }, [done])

  return (
    <>
      <PageHeader
        label="Launch"
        title={done ? `${d.name} is live.` : 'Launch a company'}
        description={done ? 'The coin is on Pump.fun, the company has a treasury, and its agent has started work.' : 'Four short steps. Nothing is sent until you sign, twice.'}
      />
      <div className="wrap grid gap-10 py-10 lg:grid-cols-12 [&>*]:min-w-0 lg:gap-12 lg:py-12">
        <div className="min-w-0 lg:col-span-7">
          {/* phones: the company takes shape at the top of the screen while you type */}
          {!done && (
            <div className="sticky top-16 z-20 -mx-5 mb-6 border-b border-line bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:hidden" aria-hidden>
              <div className="flex items-center gap-3">
                <DotGlyph seed={d.ticker || 'TICKER'} status="active" size={40} src={d.image} />
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate font-semibold tracking-[-0.01em]', !d.name && 'text-ink-3')}>{d.name || 'Your company'}</p>
                  <p className="font-mono text-[12px] text-ink-3">${d.ticker || 'TICKER'}</p>
                </div>
                <span className="font-mono text-[11px] text-ink-4">
                  {step + 1} / {STEPS.length}
                </span>
              </div>
            </div>
          )}
          <StepDots steps={STEPS} current={done ? STEPS.length : step} onSelect={progress < 0 ? setStep : undefined} />

          <div className="mt-10">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
            <m.div
              key={step}
              custom={dir}
              variants={{ enter: (d: number) => ({ opacity: 0, x: d * 28 }), show: { opacity: 1, x: 0 }, leave: (d: number) => ({ opacity: 0, x: d * -20 }) }}
              initial="enter"
              animate="show"
              exit="leave"
              transition={{ duration: 0.32, ease: EASE_OUT }}
            >
            {step === 0 && (
              <div className="grid gap-6">
                <div className="flex items-center gap-4">
                  <label className="grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-[22px] border border-dashed border-line-2 text-ink-3 hover-device:hover:border-ink-3">
                    {d.image ? <img src={d.image} alt="Coin image preview" className="size-full object-cover" /> : <ImagePlus className="size-6" />}
                    <input type="file" accept="image/*" onChange={onImage} className="sr-only" />
                  </label>
                  <div>
                    <p className="text-sm font-medium">Coin image</p>
                    <p className="mt-1 text-[13px] text-ink-3">Square, at least 400px. Without one, the company gets its dot glyph.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <TextField label="Company name" placeholder="Frogbank" value={d.name} onChange={(e) => patch({ name: e.target.value })} error={show ? errors.name : undefined} data-autofocus />
                  <TextField
                    label="Ticker"
                    prefix="$"
                    placeholder="FROG"
                    value={d.ticker}
                    onChange={(e) => patch({ ticker: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })}
                    error={show ? errors.ticker : undefined}
                    autoCapitalize="characters"
                  />
                </div>
                <TextArea label="Description" rows={3} placeholder="A bank run by a frog. Deposits not accepted." value={d.description} onChange={(e) => patch({ description: e.target.value })} hint="Shown on Pump.fun and the company page." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="X" placeholder="x.com/yourcoin" value={d.x} onChange={(e) => patch({ x: e.target.value })} hint="Optional" />
                  <TextField label="Telegram" placeholder="t.me/yourcoin" value={d.telegram} onChange={(e) => patch({ telegram: e.target.value })} hint="Optional" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-6">
                <TextArea
                  label="Mission"
                  rows={4}
                  placeholder="What should your company achieve? The agent works on this every day."
                  value={d.mission}
                  onChange={(e) => patch({ mission: e.target.value })}
                  error={show ? errors.mission : undefined}
                />
                <div className="-mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p} type="button" onClick={() => patch({ mission: p })} className="rounded-full border border-line-2 px-3 py-1.5 text-left text-[13px] text-ink-2 hover-device:hover:border-ink-3 hover-device:hover:text-ink">
                      {p}
                    </button>
                  ))}
                </div>
                <TextField label="Agent name" placeholder="Ledger" value={d.agentName} onChange={(e) => patch({ agentName: e.target.value })} hint="Optional. Holders will see it on the company page." />
                <fieldset className="min-w-0">
                  <legend className="text-sm font-medium">What it can spend on</legend>
                  <p className="mt-1 text-[13px] text-ink-3">The mandate. The agent can only fund jobs in these categories, and never move the treasury directly.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MANDATE.map((m) => {
                      const on = d.mandate.includes(m)
                      return (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={on}
                          onClick={() => patch({ mandate: on ? d.mandate.filter((x) => x !== m) : [...d.mandate, m] })}
                          className={cn('flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium', on ? 'border-ink bg-ink text-bg' : 'border-line-2 text-ink-2 hover-device:hover:text-ink')}
                        >
                          {on && <Check className="size-3.5" strokeWidth={3} />}
                          {m}
                        </button>
                      )
                    })}
                  </div>
                  {show && errors.mandate && <p className="mt-2 text-[12px] text-red">{errors.mandate}</p>}
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-8">
                <fieldset className="min-w-0">
                  <legend className="text-sm font-medium">Daily budget</legend>
                  <p className="mt-1 text-[13px] text-ink-3">The most the agent can spend in a day. Lower budget, longer runway.</p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        aria-pressed={d.budgetSol === b}
                        onClick={() => patch({ budgetSol: b })}
                        className={cn('h-14 rounded-[14px] border font-mono text-[15px]', d.budgetSol === b ? 'border-ink bg-ink text-bg' : 'border-line-2 hover-device:hover:border-ink-3')}
                      >
                        {b} SOL
                      </button>
                    ))}
                  </div>
                </fieldset>
                <TextField
                  label="Initial buy"
                  inputMode="decimal"
                  prefix=""
                  placeholder="0"
                  value={d.initialBuySol ? String(d.initialBuySol) : ''}
                  onChange={(e) => patch({ initialBuySol: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                  hint="Optional. SOL you buy the coin with at launch, from your own wallet."
                />
                <div className="rounded-card border border-line p-5">
                  <p className="text-sm font-medium">Where creator fees go</p>
                  <p className="mt-1 text-[13px] text-ink-3">Fixed at launch for every company in the network.</p>
                  <ul className="mt-4 grid gap-2">
                    {routing.map((r) => (
                      <li key={r.k} className="flex items-center justify-between text-[15px]">
                        <span className="flex items-center gap-2.5">
                          <span className={`${r.cls} size-2.5 rounded-full`} />
                          {r.k}
                        </span>
                        <span className="font-mono">{Math.round(r.v * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-6">
                <dl className="divide-y divide-line rounded-card border border-line">
                  {[
                    ['Company', `${d.name} ($${d.ticker})`],
                    ['Mission', d.mission],
                    ['Can spend on', d.mandate.join(', ')],
                    ['Daily budget', sol(d.budgetSol, 1)],
                    ['Initial buy', d.initialBuySol ? sol(d.initialBuySol, 2) : 'None'],
                  ].map(([k, v]) => (
                    <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                      <dt className="text-sm text-ink-3">{k}</dt>
                      <dd className="text-[15px]">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <p className="text-sm font-medium">What happens when you launch</p>
                  <ol className="mt-3 divide-y divide-line rounded-card border border-line" aria-live="polite">
                    {TX.map((t, i) => {
                      const state = progress > i ? 'done' : progress === i ? 'active' : 'idle'
                      return (
                        <li key={t} className="flex items-center gap-3 px-5 py-3.5">
                          <span className="grid size-6 place-items-center">
                            {state === 'done' ? (
                              <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_POP}>
                                <Check className="size-4 text-lime-text" strokeWidth={3} aria-label="Done" />
                              </m.span>
                            ) : state === 'active' ? (
                              <DotsLoader className="size-[18px] text-ink" label="In progress" />
                            ) : (
                              <span className="size-2 rounded-full bg-[var(--dot-dim)]" />
                            )}
                          </span>
                          <span className={cn('flex-1 text-[15px]', state === 'idle' && 'text-ink-3')}>{t}</span>
                          <span className="font-mono text-[12px] text-ink-4">Signature {i === 0 ? 1 : 2}</span>
                        </li>
                      )
                    })}
                  </ol>
                </div>
                {done && (
                  <m.div ref={birth} className="rounded-card border border-line bg-surface p-4 sm:p-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
                    <p className="label">Your company just joined the network</p>
                    <NetworkField companies={[...companies, newcomer(d)]} highlight="new" delay={0.15} className="mt-2" />
                  </m.div>
                )}
                {done && (
                  <div className="flex flex-wrap gap-3">
                    <Button to="/network" variant="primary" size="lg" arrow>
                      See it in the network
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => {
                        setD(blank)
                        setStep(0)
                        setProgress(-1)
                      }}
                    >
                      Launch another
                    </Button>
                  </div>
                )}
              </div>
            )}
            </m.div>
            </AnimatePresence>
          </div>

          {!done && (
            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || progress >= 0}>
                Back
              </Button>
              {step < 3 ? (
                <Button variant="primary" size="lg" onClick={next} arrow>
                  Continue
                </Button>
              ) : (
                <Button variant="primary" size="lg" onClick={launch} disabled={progress >= 0} className="disabled:opacity-100">
                  {!address ? 'Connect wallet to launch' : progress >= 0 ? (
                    <>
                      <DotsLoader accent="currentColor" className="text-on-lime" label="Launching" /> Launching…
                    </>
                  ) : 'Sign and launch'}
                </Button>
              )}
            </div>
          )}
        </div>

        <aside aria-label="Preview" className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <CompanyPreview d={d} />
          </div>
        </aside>
      </div>
    </>
  )
}
