import type { Company } from '@/types'
import { Button } from '@/components/ui/Button'
import { FieldLegend, NetworkField } from '@/components/dots/NetworkField'

export function Hero({ companies }: { companies: Company[] }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* a faint field of dots: the space the network lives in */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_70%_at_70%_45%,#000,transparent)] opacity-60"
        style={{ backgroundImage: 'radial-gradient(var(--line-2) 1px, transparent 1.2px)', backgroundSize: '22px 22px' }}
      />
      <div className="wrap relative pt-14 pb-12 lg:pt-20 lg:pb-16">
        <p className="label">A holding company for meme companies · Solana</p>
        <h1 id="hero-title" className="mt-6 text-display font-semibold">
          Every meme coin
          <br />
          <span className="text-ink-3">is a company now.</span>
        </h1>
        <div className="mt-10 grid gap-10 lg:mt-4 lg:grid-cols-12 [&>*]:min-w-0 lg:gap-6">
          <div className="lg:col-span-4 lg:pt-16">
            <p className="max-w-[34rem] text-lead text-ink-2">
              Launch on Pump.fun and DOTS gives your coin a treasury, an AI agent to run it, and one rule: creator fees are its only income.{' '}
              <span className="text-ink">Companies that earn keep going. Companies that don’t are sold to someone who can save them.</span>
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/launch" variant="primary" size="lg" arrow>
                Launch a company
              </Button>
              <Button to="/network" size="lg">
                Explore the network
              </Button>
            </div>
            <FieldLegend className="mt-10 hidden lg:flex" />
          </div>
          <div className="lg:col-span-8">
            <NetworkField companies={companies} className="-mx-2 sm:mx-0" />
            <FieldLegend className="mt-2 justify-center lg:hidden" />
          </div>
        </div>
      </div>
    </section>
  )
}
