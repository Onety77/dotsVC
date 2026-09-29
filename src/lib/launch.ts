/** What the launch flow collects. NORA: map to the launch transactions. */
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

/** Placeholder routing of creator fees. NORA: replace with the program's real split. */
export const routing = [
  { k: 'Company treasury', v: 0.8, cls: 'bg-lime' },
  { k: 'DOTS holdco', v: 0.1, cls: 'bg-ink' },
  { k: 'Creator', v: 0.1, cls: 'bg-ink-4' },
]

