/** What the launch flow collects. */
export interface LaunchDraft {
  name: string
  ticker: string
  description: string
  image?: string
  x: string
  telegram: string
  mission: string
  agentName: string
  mandate: string[]
  budgetSol: number
  initialBuySol: number
}

/** Placeholder routing of creator fees. */
export const routing = [
  { k: 'Company treasury', v: 0.8, cls: 'bg-lime' },
  { k: 'DotCo holdco', v: 0.1, cls: 'bg-ink' },
  { k: 'Creator', v: 0.1, cls: 'bg-ink-4' },
]

