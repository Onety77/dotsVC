/**
 * Domain types for the DotCo UI.
 * Treasury and bids are in SOL; market figures and fees are in USD.
 */

export type CompanyStatus = 'active' | 'paused' | 'distressed'
export type JobStatus = 'shipping' | 'queued' | 'done' | 'blocked'
export type AgentState = 'working' | 'idle' | 'offline'

export interface Agent {
  name: string
  mission: string
  state: AgentState
  /** Latest things the agent did, newest first. */
  log: { at: string; text: string }[]
}

export interface Job {
  id: string
  title: string
  status: JobStatus
  costSol: number
}

export interface Artifact {
  id: string
  name: string
  kind: 'store' | 'app' | 'game' | 'bot' | 'content'
  version: string
  note: string
}

export interface Company {
  id: string
  name: string
  ticker: string
  tagline: string
  status: CompanyStatus
  launchedAt: string
  /** Days the treasury lasts at the current burn rate. */
  runwayDays: number
  treasurySol: number
  burnSolPerDay: number
  fees30dUsd: number
  marketCapUsd: number
  priceUsd: number
  change24h: number
  holders: number
  volume24hUsd: number
  agent: Agent
  jobs: Job[]
  artifacts: Artifact[]
  timeline: { at: string; text: string }[]
  /** Coin art. */
  image?: string
}

export interface Listing {
  companyId: string
  reason: string
  auctionEndsAt: string
  reservePriceSol: number
  topBidSol?: number
  bids: number
}

export interface Bid {
  id: string
  bidder: string
  companyId: string
  amountSol: number
  at: string
  plan: string
}

export interface NetworkStats {
  companies: number
  treasurySol: number
  fees30dUsd: number
  avgRunwayDays: number
  inReceivership: number
  rescueCapitalSol: number
}

/** Visual state a data-driven section can be in. */
export type ViewState = 'ready' | 'loading' | 'empty' | 'error'
