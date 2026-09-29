import type { ReactNode } from 'react'
import { Section, SectionHead } from '@/components/ui/Section'
import { Item, Stagger } from '@/components/motion/Reveal'
import { EarnDiagram, HireDiagram, LaunchDiagram, SurviveDiagram } from './LifecycleDiagrams'

const stages: { id: string; n: string; title: string; body: string; art: ReactNode }[] = [
  { id: 'launch', n: '01', title: 'Launch', body: 'Launch the coin on Pump.fun. DOTS builds the company around it: a treasury, a mandate, and a seat in the holdco.', art: <LaunchDiagram /> },
  { id: 'hire', n: '02', title: 'Hire', body: 'Write a mission and an AI agent becomes the CEO. It can only spend on jobs its mandate allows, and every payment is on-chain.', art: <HireDiagram /> },
  { id: 'earn', n: '03', title: 'Earn', body: 'Creator fees fill the treasury and the agent’s work burns it. Runway is what’s left, counted in weeks, one dot each.', art: <EarnDiagram /> },
  { id: 'survive', n: '04', title: 'Survive, or be sold', body: 'Under three weeks, spending pauses. At zero, the company goes into receivership, and its line to the holdco is cut.', art: <SurviveDiagram /> },
]

/** A company's life in four stages. Each diagram plays its own verb while it's on screen. */
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
      <Stagger as="ol" gap={0.09} className="mt-14 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s) => (
          <Item as="li" key={s.id} className="flex flex-col bg-bg p-6 lg:p-7">
            <div className="h-24 rounded-[12px] border border-line bg-surface px-3">{s.art}</div>
            <p className="mt-6 font-mono text-[12px] text-ink-3">{s.n}</p>
            <h3 className="mt-1.5 text-h3 font-semibold">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
          </Item>
        ))}
      </Stagger>
    </Section>
  )
}
