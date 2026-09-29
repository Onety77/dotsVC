import type { Company } from '@/types'
import { cn } from '@/lib/cn'
import { ago, sol } from '@/lib/format'
import { DotGlyph } from '@/components/dots/DotGlyph'

const jobTone = {
  shipping: 'text-lime-text',
  queued: 'text-ink-3',
  done: 'text-ink-3 line-through decoration-ink-4',
  blocked: 'text-red',
} as const
const jobLabel = { shipping: 'Shipping', queued: 'Queued', done: 'Done', blocked: 'Blocked' } as const

/**
 * What the agent CEO is doing: its mission, its latest actions, and its jobs.
 * NORA: log lines from the agent runtime; jobs from the mandate/escrow program.
 */
export function AgentConsole({ company, now, className }: { company: Company; now: number; className?: string }) {
  const a = company.agent
  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <div className="flex items-center gap-3 border-b border-line p-5">
        <span className="relative">
          <DotGlyph seed={`${company.ticker}-agent`} status={company.status} size={40} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {a.name} <span className="font-normal text-ink-3">· CEO of {company.name}</span>
          </p>
          <p className="flex items-center gap-2 font-mono text-[12px] text-ink-3">
            <span className={cn('size-1.5 rounded-full', a.state === 'working' ? 'bg-lime' : a.state === 'idle' ? 'bg-ink-4' : 'bg-red')} />
            {a.state === 'working' ? 'Working' : a.state === 'idle' ? 'Idle' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="border-b border-line p-5">
        <p className="label">Mission</p>
        <p className="mt-2 text-[15px] leading-relaxed">{a.mission}</p>
      </div>
      <ol className="border-b border-line p-5">
        <li className="label mb-3">Latest</li>
        {a.log.map((l, i) => (
          <li key={i} className="grid grid-cols-[64px_1fr] gap-3 py-1.5 text-[14px]">
            <span className="font-mono text-[12px] text-ink-4">{ago(l.at, now)}</span>
            <span className="text-ink-2">{l.text}</span>
          </li>
        ))}
      </ol>
      {company.jobs.length > 0 && (
        <ul className="p-5">
          <li className="label mb-3">Jobs</li>
          {company.jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between gap-4 py-1.5 text-[14px]">
              <span className={cn('min-w-0 truncate', j.status === 'done' ? 'text-ink-3' : 'text-ink')}>{j.title}</span>
              <span className="flex shrink-0 items-center gap-3">
                {j.costSol > 0 && <span className="font-mono text-[12px] text-ink-3">{sol(j.costSol)}</span>}
                <span className={cn('w-16 text-right font-mono text-[12px]', jobTone[j.status])}>{jobLabel[j.status]}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
