import { DotGlyph } from '@/components/dots/DotGlyph'
import { RunwayDots } from '@/components/dots/RunwayDots'
import { sol } from '@/lib/format'
import { routing, type LaunchDraft } from '@/lib/launch'

/** The company as it's being built, updating as you type. */
export function CompanyPreview({ d }: { d: LaunchDraft }) {
  const ticker = d.ticker || 'TICKER'
  // what 30 SOL of treasury would buy at this budget, to make the rule tangible
  const exampleRunway = d.budgetSol > 0 ? Math.round(30 / d.budgetSol) : 0
  return (
    <div className="rounded-card border border-line bg-surface">
      <div className="flex items-center gap-4 border-b border-line p-5">
        <DotGlyph seed={ticker} status="active" size={56} src={d.image} />
        <div className="min-w-0">
          <p className="label">Your company</p>
          <p className="mt-1 truncate text-[20px] font-semibold tracking-[-0.02em]">{d.name || 'Unnamed company'}</p>
          <p className="font-mono text-[13px] text-ink-3">${ticker}</p>
        </div>
      </div>
      <div className="border-b border-line p-5">
        <p className="label">CEO{d.agentName ? ` · ${d.agentName}` : ''}</p>
        <p className="mt-2 text-[15px] text-ink-2">{d.mission || 'Write a mission and your agent will work on it every day.'}</p>
        {d.mandate.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {d.mandate.map((m) => (
              <li key={m} className="rounded-full border border-line-2 px-2.5 py-0.5 text-[12px] text-ink-2">
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-b border-line p-5">
        <p className="label">Creator fees go to</p>
        <div className="mt-3 flex h-2.5 gap-[3px]">
          {routing.map((r) => (
            <span key={r.k} className={`${r.cls} rounded-full`} style={{ flexGrow: r.v, flexBasis: 0 }} />
          ))}
        </div>
        <ul className="mt-3 grid gap-1.5 text-[13px]">
          {routing.map((r) => (
            <li key={r.k} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-ink-2">
                <span className={`${r.cls} size-2 rounded-full`} />
                {r.k}
              </span>
              <span className="font-mono">{Math.round(r.v * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-5">
        <p className="label">Runway rule</p>
        <p className="mt-2 text-[15px] text-ink-2">
          At <span className="font-mono text-ink">{sol(d.budgetSol, 1)}</span> a day, every 30 SOL in the treasury is about {exampleRunway} days of life.
        </p>
        <RunwayDots days={exampleRunway} weeks={14} className="mt-3" />
      </div>
    </div>
  )
}
