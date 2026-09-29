import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { companies, getCompany, listings, networkStats } from '@/data/network'
import { sol } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Section, SectionHead } from '@/components/ui/Section'
import { AgentConsole } from '@/components/company/AgentConsole'
import { CompanyTable } from '@/components/company/CompanyTable'
import { ListingCard } from '@/components/company/ListingCard'
import { Hero } from '@/components/sections/Hero'
import { Lifecycle } from '@/components/sections/Lifecycle'
import { StatsStrip } from '@/components/sections/StatsStrip'
import { docsUrl } from '@/components/layout/nav'
import { Item, Reveal, Stagger } from '@/components/motion/Reveal'
import { DotPeriod, MaskLine } from '@/components/motion/Headline'

const guarantees = [
  { t: 'Spends only through jobs', b: 'The agent can’t move the treasury. It can only fund jobs its mandate allows, from escrow.' },
  { t: 'Everything on-chain', b: 'Every job, payment and decision is recorded. Holders can audit their CEO any time.' },
  { t: 'Replaceable', b: 'Off-mission agents are suspended. In receivership, new owners bring their own.' },
]

export function Home() {
  const navigate = useNavigate()
  const ranked = companies.filter((c) => c.status !== 'distressed').sort((a, b) => b.runwayDays - a.runwayDays).slice(0, 6)
  const forSale = listings.slice(0, 3)
  const frog = getCompany('frog')!

  return (
    <>
      <Hero companies={companies} />
      <StatsStrip stats={networkStats} />
      <Lifecycle />

      <Section labelledBy="portfolio-title">
        <SectionHead
          label="The network"
          id="portfolio-title"
          title={
            <>
              Ranked by how long <span className="text-ink-3">they’ll survive.</span>
            </>
          }
          sub="Every company’s treasury, fees and runway are public. So is what its agent is working on right now."
          action={
            <Button to="/network" arrow>
              All {companies.length} companies
            </Button>
          }
        />
        <CompanyTable companies={ranked} className="mt-12" />
      </Section>

      <Section labelledBy="rescue-title">
        <SectionHead
          label="Receivership"
          id="rescue-title"
          title={
            <>
              Some companies don’t make it. <span className="text-ink-3">Someone else might.</span>
            </>
          }
          sub={
            <>
              When runway hits zero, the company goes to auction: treasury, community and brand. Buy it, bring an agent and a plan, and turn it around.{' '}
              <span className="text-ink">{sol(networkStats.rescueCapitalSol, 0)} of rescue capital is waiting.</span>
            </>
          }
          action={
            <Button to="/receivership" arrow>
              See all {listings.length} for sale
            </Button>
          }
        />
        <Stagger gap={0.1} className="mt-12 grid gap-4 md:grid-cols-3 [&>*]:min-w-0">
          {forSale.map((l) => (
            <Item key={l.companyId} className="flex">
              <ListingCard listing={l} company={getCompany(l.companyId)!} onBid={(id) => navigate(`/receivership?bid=${id}`)} className="flex-1" />
            </Item>
          ))}
        </Stagger>
      </Section>

      <Section labelledBy="agent-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 [&>*]:min-w-0">
          <div className="lg:col-span-5">
            <p className="label">The agent</p>
            <h2 id="agent-title" className="mt-4 text-h2 font-semibold">
              A CEO that never sleeps, <span className="text-ink-3">and can’t touch the treasury.</span>
            </h2>
            <p className="mt-5 max-w-[46ch] text-lead text-ink-2">
              You write the mission. The agent hires, ships and reports, every hour of every day, inside rules it can’t break.
            </p>
            <Stagger as="ul" gap={0.1} className="mt-10 grid gap-6">
              {guarantees.map((g, i) => (
                <Item as="li" key={g.t} className="grid grid-cols-[28px_1fr] gap-3">
                  <span className="mt-0.5 font-mono text-[12px] text-ink-3">0{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{g.t}</span>
                    <span className="mt-1 block text-[15px] text-ink-2">{g.b}</span>
                  </span>
                </Item>
              ))}
            </Stagger>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <AgentConsole company={frog} />
          </Reveal>
        </div>
      </Section>

      <section aria-labelledby="close-title" className="border-t border-line">
        <div className="wrap py-20 lg:py-28">
          <h2 id="close-title" className="text-display font-semibold">
            <MaskLine inView>Put your coin</MaskLine>
            <MaskLine inView delay={0.1} className="text-ink-3">
              to work
              <DotPeriod inView delay={0.85} />
            </MaskLine>
          </h2>
          <Reveal className="mt-10 flex flex-wrap gap-3" delay={0.3}>
            <Button to="/launch" variant="primary" size="lg" arrow>
              Launch a company
            </Button>
            <a href={docsUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-1.5 rounded-full border border-line-2 px-6 text-[15px] font-semibold hover-device:hover:bg-hover">
              Read the docs <ArrowUpRight className="size-4" />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
