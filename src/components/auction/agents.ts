import type { Bid } from '@/types'

/** Who would run the company after the rescue. */
export const agentLabel: Record<Bid['agent'], string> = {
  bring: 'Brings its own agent',
  dots: 'Fresh DotCo agent',
  keep: 'Keeps the current agent',
}
