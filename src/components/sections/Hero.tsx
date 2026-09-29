import { m } from 'motion/react'
import type { Company } from '@/types'
import { EASE_OUT } from '@/lib/motion'
import { Button } from '@/components/ui/Button'
import { FieldLegend, NetworkField } from '@/components/dots/NetworkField'
import { DotGrid } from '@/components/dots/DotGrid'
import { HoldcoTicker } from '@/components/dots/HoldcoTicker'
import { DotPeriod, MaskLine } from '@/components/motion/Headline'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE_OUT },
})

/**
 * The opening: the headline lands line by line and its full stop drops in as a dot.
 * Meanwhile the network assembles on the right and starts earning.
 */
export function Hero({ companies }: { companies: Company[] }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* a faint field of dots: the space the network lives in */}
      <DotGrid className="[mask-image:radial-gradient(70%_70%_at_70%_45%,#000,transparent)] opacity-70" />
      <div className="wrap relative pt-14 pb-12 lg:pt-20 lg:pb-16">
        <m.p className="label" {...rise(0)}>
          A holding company for meme companies · Solana
        </m.p>
        <h1 id="hero-title" className="mt-6 text-display font-semibold">
          <MaskLine delay={0.08}>Every meme coin</MaskLine>
          <MaskLine delay={0.18} className="text-ink-3">
            is a company now
            <DotPeriod delay={1.05} />
          </MaskLine>
        </h1>
        <div className="mt-10 grid gap-10 lg:mt-4 lg:grid-cols-12 [&>*]:min-w-0 lg:gap-6">
          <div className="lg:col-span-4 lg:pt-16">
            <m.p className="max-w-[34rem] text-lead text-ink-2" {...rise(0.45)}>
              Launch on Pump.fun and DOTS gives your coin a treasury, an AI agent to run it, and one rule: creator fees are its only income.{' '}
              <span className="text-ink">Companies that earn keep going. Companies that don’t are sold to someone who can save them.</span>
            </m.p>
            <m.div className="mt-9 flex flex-wrap gap-3" {...rise(0.55)}>
              <Button to="/launch" variant="primary" size="lg" arrow>
                Launch a company
              </Button>
              <Button to="/network" size="lg">
                Explore the network
              </Button>
            </m.div>
            <m.div className="mt-10 hidden lg:block" {...rise(0.7)}>
              <FieldLegend />
              <HoldcoTicker className="mt-6" />
            </m.div>
          </div>
          <div className="lg:col-span-8">
            <NetworkField companies={companies} delay={0.25} className="-mx-2 sm:mx-0" />
            <div className="mt-2 flex flex-col items-center gap-3 lg:hidden">
              <HoldcoTicker />
              <FieldLegend className="justify-center" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
