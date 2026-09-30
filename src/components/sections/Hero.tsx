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
 * The opening: the headline lands line by line and its full stop drops in as a dot,
 * while the network assembles and starts earning. Everything that matters (headline,
 * the map, a line of copy and both actions) fits the first screen on a laptop and a phone.
 * On phones the map comes straight after the headline.
 */
export function Hero({ companies }: { companies: Company[] }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* a faint field of dots: the space the network lives in */}
      <DotGrid className="[mask-image:radial-gradient(70%_70%_at_70%_45%,#000,transparent)]" />
      <div className="wrap relative pt-7 pb-10 sm:pt-10 lg:pt-12 lg:pb-14">
        <m.p className="label" {...rise(0)}>
          <span className="sm:hidden">Meme companies on Solana</span>
          <span className="hidden sm:inline">A holding company for meme companies · Solana</span>
        </m.p>
        <h1 id="hero-title" className="mt-4 text-display font-semibold max-sm:text-[9.4vw] lg:mt-5">
          <MaskLine delay={0.08}>Every meme coin</MaskLine>
          <MaskLine delay={0.18} className="text-ink-3">
            is a company now
            <DotPeriod delay={1.05} />
          </MaskLine>
        </h1>
        <div className="mt-2 grid lg:mt-2 lg:grid-cols-12 lg:gap-6 [&>*]:min-w-0">
          <div className="order-2 lg:order-1 lg:col-span-4 lg:pt-10">
            <m.p className="max-w-[34rem] text-lead text-ink-2" {...rise(0.45)}>
              <span className="lg:hidden">Your coin becomes a company with a treasury and an AI CEO. Earn, or be sold.</span>
              <span className="hidden lg:inline">
                Launch on Pump.fun and your coin becomes a company, with a treasury and an AI agent as its CEO.{' '}
                <span className="text-ink">Creator fees are its only income. Earn, or be sold.</span>
              </span>
            </m.p>
            <m.div className="mt-5 flex flex-wrap gap-2.5 sm:gap-3 lg:mt-8" {...rise(0.55)}>
              <Button to="/launch" variant="primary" size="lg" arrow className="max-sm:h-11 max-sm:px-4 max-sm:text-sm">
                Launch a company
              </Button>
              <Button to="/network" size="lg" className="max-sm:h-11 max-sm:px-4 max-sm:text-sm">
                <span className="sm:hidden">See the network</span>
                <span className="max-sm:hidden">Explore the network</span>
              </Button>
            </m.div>
            <m.div className="mt-9 hidden lg:block" {...rise(0.7)}>
              <FieldLegend />
              <HoldcoTicker className="mt-5" />
            </m.div>
            <div className="mt-8 flex flex-col items-center gap-3 lg:hidden">
              <HoldcoTicker />
              <FieldLegend className="justify-center" />
            </div>
          </div>
          <div className="order-1 -mx-2 mb-3 sm:mx-0 lg:order-2 lg:col-span-8 lg:mb-0">
            <NetworkField companies={companies} delay={0.25} />
          </div>
        </div>
      </div>
    </section>
  )
}
