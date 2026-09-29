import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Section, SectionHead } from '@/components/ui/Section'

/* Four small dot diagrams, one per stage. Static now; each is drawn to move later (see HANDOFF motion plan). */

const Holdco = ({ x = 20, y = 50 }: { x?: number; y?: number }) => (
  <>
    <circle cx={x} cy={y} r={9} fill="var(--ink)" />
    <circle cx={x} cy={y} r={15} fill="none" stroke="var(--line-2)" />
  </>
)

const diagrams: Record<string, ReactNode> = {
  launch: (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden>
      <Holdco />
      <line x1="35" y1="50" x2="150" y2="50" stroke="var(--ink)" strokeOpacity="0.2" strokeDasharray="2 5" strokeLinecap="round" />
      <circle cx="160" cy="50" r="12" fill="var(--lime)" />
      <circle cx="160" cy="50" r="20" fill="none" stroke="var(--lime)" strokeOpacity="0.35" />
    </svg>
  ),
  hire: (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden>
      <circle cx="100" cy="50" r="12" fill="var(--lime)" />
      {/* the agent orbits the company it runs */}
      <circle cx="100" cy="50" r="30" fill="none" stroke="var(--line-2)" />
      <circle cx="130" cy="50" r="5" fill="var(--ink)" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={40 + i * 8} cy="50" r="2.4" fill="var(--ink)" opacity={0.25 + i * 0.25} />
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={144 + i * 8} cy="50" r="2.4" fill="var(--ink)" opacity={0.75 - i * 0.25} />
      ))}
    </svg>
  ),
  earn: (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={24 + i * 14} cy="50" r="4.5" fill={i < 8 ? 'var(--ink)' : 'var(--dot-dim)'} />
      ))}
      <path d="M24 26 H 122" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" />
      <text x="24" y="20" className="fill-ink-3 font-mono text-[10px]">
        FEES IN
      </text>
      <path d="M136 74 H 178" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      <text x="136" y="88" className="fill-ink-3 font-mono text-[10px]">
        BURN
      </text>
    </svg>
  ),
  survive: (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden>
      <Holdco x={40} />
      <path d="M 120 6 A 60 60 0 0 1 120 94" fill="none" stroke="var(--red)" strokeOpacity="0.55" strokeDasharray="2 5" strokeLinecap="round" />
      <line x1="55" y1="50" x2="92" y2="50" stroke="var(--ink)" strokeOpacity="0.2" />
      <line x1="100" y1="44" x2="108" y2="56" stroke="var(--red)" strokeWidth="1.5" />
      <circle cx="160" cy="50" r="10" fill="var(--red)" />
    </svg>
  ),
}

const stages = [
  { id: 'launch', n: '01', title: 'Launch', body: 'Launch the coin on Pump.fun. DOTS builds the company around it: a treasury, a mandate, and a seat in the holdco.' },
  { id: 'hire', n: '02', title: 'Hire', body: 'Write a mission and an AI agent becomes the CEO. It can only spend on jobs its mandate allows, and every payment is on-chain.' },
  { id: 'earn', n: '03', title: 'Earn', body: 'Creator fees fill the treasury and the agent’s work burns it. Runway is what’s left, counted in weeks, one dot each.' },
  { id: 'survive', n: '04', title: 'Survive, or be sold', body: 'Under three weeks, spending pauses. At zero, the company goes into receivership, and its line to the holdco is cut.' },
]

export function Lifecycle() {
  return (
    <Section labelledBy="life-title">
      <SectionHead
        label="How a company lives"
        id="life-title"
        title={
          <>
            One rule: <span className="text-ink-3">earn more than you burn.</span>
          </>
        }
      />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s) => (
          <li key={s.id} className="flex flex-col bg-bg p-6 lg:p-7">
            <div className={cn('h-24 rounded-[12px] border border-line bg-surface px-3')}>{diagrams[s.id]}</div>
            <p className="mt-6 font-mono text-[12px] text-ink-3">{s.n}</p>
            <h3 className="mt-1.5 text-h3 font-semibold">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
