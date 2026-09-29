import type { Bid, Company, Listing, NetworkStats } from '@/types'

// NORA: sample data. Every company, figure, agent and bid here is fictional.
// Replace with the indexer / program reads; shapes match src/types.

/** "Now" for the sample data, so countdowns and "3h ago" stay stable. */
export const sampleNow = Date.parse('2026-09-29T19:00:00Z')
const at = (h: number) => new Date(sampleNow - h * 3600_000).toISOString()
const days = (d: number) => at(d * 24)

type Seed = Omit<Company, 'jobs' | 'artifacts' | 'timeline' | 'agent'> & {
  agent: [name: string, mission: string, state: Company['agent']['state']]
  log: string[]
  jobs: [string, Company['jobs'][number]['status'], number][]
  artifacts?: [string, Company['artifacts'][number]['kind'], string, string][]
  timeline: [number, string][]
}

const make = (s: Seed): Company => ({
  ...s,
  agent: { name: s.agent[0], mission: s.agent[1], state: s.agent[2], log: s.log.map((text, i) => ({ at: at(i * 3 + 1), text })) },
  jobs: s.jobs.map(([title, status, costSol], i) => ({ id: `${s.id}-j${i}`, title, status, costSol })),
  artifacts: (s.artifacts ?? []).map(([name, kind, version, note], i) => ({ id: `${s.id}-a${i}`, name, kind, version, note })),
  timeline: s.timeline.map(([d, text]) => ({ at: days(d), text })),
})

export const companies: Company[] = [
  make({
    id: 'frog', name: 'Frogbank', ticker: 'FROG', tagline: 'A bank run by a frog. Deposits not accepted.',
    status: 'active', launchedAt: days(58), runwayDays: 96, treasurySol: 412.6, burnSolPerDay: 4.3,
    fees30dUsd: 284_000, marketCapUsd: 38_200_000, priceUsd: 0.0382, change24h: 0.124, holders: 48_391, volume24hUsd: 6_840_000,
    agent: ['Ledger', 'Grow the pond: land two exchange listings and turn $FROG into a brand people wear.', 'working'],
    log: ['Negotiated listing terms with a mid-tier exchange', 'Paid 3 designers from escrow for the merch drop', 'Posted the weekly treasury report', 'Rejected a paid-shill offer: outside mandate'],
    jobs: [['Exchange listing application', 'shipping', 42], ['Merch drop: 400 hoodies', 'shipping', 18.5], ['Holder dashboard v2', 'queued', 9], ['Weekly treasury report', 'done', 0.4]],
    artifacts: [['Frogbank Merch Store', 'store', '1.4', '+12% of revenue'], ['Pond Dashboard', 'app', '2.0', '31K monthly visits'], ['Ribbit Bot', 'bot', '0.9', 'Telegram, 18K members']],
    timeline: [[58, 'Launched on Pump.fun'], [51, '10K holders'], [37, 'Graduated to PumpSwap'], [21, 'Merch store live'], [6, 'Listing application submitted']],
  }),
  make({
    id: 'loaf', name: 'Loafers Inc', ticker: 'LOAF', tagline: 'Bread, but a company. Rises every morning.',
    status: 'active', launchedAt: days(44), runwayDays: 71, treasurySol: 238.1, burnSolPerDay: 3.35,
    fees30dUsd: 198_000, marketCapUsd: 21_700_000, priceUsd: 0.0217, change24h: 0.052, holders: 31_204, volume24hUsd: 3_120_000,
    agent: ['Crumb', 'Ship small products every week and keep the community fed.', 'working'],
    log: ['Released Bake-Off game v1.1', 'Opened a bounty for a Spanish translation', 'Bought back 0.4% of supply within mandate'],
    jobs: [['Bake-Off game v1.2', 'shipping', 6], ['Spanish community launch', 'queued', 4], ['Sticker pack', 'done', 1.2]],
    artifacts: [['Bake-Off', 'game', '1.1', '9K players'], ['Loaf Stickers', 'content', '1.0', 'Telegram + X']],
    timeline: [[44, 'Launched on Pump.fun'], [30, 'Graduated to PumpSwap'], [12, 'Bake-Off game live']],
  }),
  make({
    id: 'mech', name: 'Moon Mechanics', ticker: 'MECH', tagline: 'We fix rockets that don’t exist.',
    status: 'active', launchedAt: days(33), runwayDays: 62, treasurySol: 176.4, burnSolPerDay: 2.85,
    fees30dUsd: 176_000, marketCapUsd: 14_900_000, priceUsd: 0.0149, change24h: -0.031, holders: 22_860, volume24hUsd: 2_210_000,
    agent: ['Wrench', 'Drive attention with weekly launches of absurd hardware, and monetise it.', 'working'],
    log: ['Commissioned a 3D model of the Mk. II rocket', 'Scheduled a live build stream'],
    jobs: [['Mk. II rocket reveal', 'shipping', 7.5], ['Live build stream', 'queued', 2]],
    artifacts: [['Rocket Configurator', 'app', '0.6', '4K rockets built']],
    timeline: [[33, 'Launched on Pump.fun'], [19, 'Graduated to PumpSwap'], [4, 'Configurator live']],
  }),
  make({
    id: 'pengw', name: 'Sir Pengwin', ticker: 'PNGW', tagline: 'Cold-blooded capital. Warm community.',
    status: 'active', launchedAt: days(71), runwayDays: 41, treasurySol: 142.2, burnSolPerDay: 3.45,
    fees30dUsd: 142_000, marketCapUsd: 26_300_000, priceUsd: 0.0263, change24h: 0.083, holders: 40_118, volume24hUsd: 4_470_000,
    agent: ['Tux', 'Maximise market cap through partnerships with other Firms in the network.', 'working'],
    log: ['Proposed a joint drop with Loafers Inc', 'Paid an artist for the winter collection'],
    jobs: [['Joint drop with $LOAF', 'queued', 5], ['Winter collection', 'shipping', 11]],
    artifacts: [['Pengwin Winter Collection', 'store', '1.0', 'Launching soon']],
    timeline: [[71, 'Launched on Pump.fun'], [60, 'Graduated to PumpSwap'], [2, 'Partnership proposal sent']],
  }),
  make({
    id: 'nap', name: 'Catnap Capital', ticker: 'NAP', tagline: 'Sleeps sixteen hours. Compounds twenty-four.',
    status: 'active', launchedAt: days(26), runwayDays: 89, treasurySol: 121.4, burnSolPerDay: 1.36,
    fees30dUsd: 121_000, marketCapUsd: 9_800_000, priceUsd: 0.0098, change24h: 0.021, holders: 15_402, volume24hUsd: 1_380_000,
    agent: ['Purr', 'Keep burn low, build utility slowly, never chase a pump.', 'idle'],
    log: ['Declined three sponsorship offers', 'Renewed the nap-tracker domain'],
    jobs: [['Nap tracker app', 'shipping', 3.2]],
    artifacts: [['Nap Tracker', 'app', '0.3', 'Beta']],
    timeline: [[26, 'Launched on Pump.fun'], [15, 'Graduated to PumpSwap']],
  }),
  make({
    id: 'quack', name: 'Duckworks', ticker: 'QUACK', tagline: 'Loud, waterproof, profitable.',
    status: 'active', launchedAt: days(19), runwayDays: 54, treasurySol: 88.9, burnSolPerDay: 1.65,
    fees30dUsd: 96_000, marketCapUsd: 7_100_000, priceUsd: 0.0071, change24h: 0.187, holders: 11_930, volume24hUsd: 1_940_000,
    agent: ['Quill', 'Win X every day with original content and turn attention into fees.', 'working'],
    log: ['Posted 14 original clips this week', 'Hired a voice actor from the network'],
    jobs: [['Daily clips', 'shipping', 2.4], ['Voice actor contract', 'done', 1.5]],
    timeline: [[19, 'Launched on Pump.fun'], [8, 'Graduated to PumpSwap']],
  }),
  make({
    id: 'gobln', name: 'Goblin Freight', ticker: 'GOBLN', tagline: 'Ships anything. Asks nothing.',
    status: 'active', launchedAt: days(12), runwayDays: 33, treasurySol: 41.7, burnSolPerDay: 1.26,
    fees30dUsd: 58_000, marketCapUsd: 3_400_000, priceUsd: 0.0034, change24h: -0.064, holders: 6_210, volume24hUsd: 610_000,
    agent: ['Grub', 'Build a meme logistics game and a holder leaderboard.', 'working'],
    log: ['Wrote the game design doc', 'Posted a job for a pixel artist'],
    jobs: [['Logistics game prototype', 'queued', 6], ['Pixel artist', 'queued', 3]],
    timeline: [[12, 'Launched on Pump.fun']],
  }),
  make({
    id: 'slow', name: 'Snail Mail', ticker: 'SLOW', tagline: 'Delivers eventually.',
    status: 'paused', launchedAt: days(48), runwayDays: 18, treasurySol: 22.3, burnSolPerDay: 1.24,
    fees30dUsd: 21_000, marketCapUsd: 1_900_000, priceUsd: 0.0019, change24h: -0.112, holders: 4_880, volume24hUsd: 140_000,
    agent: ['Shell', 'Re-align the narrative and relaunch the letters campaign.', 'idle'],
    log: ['Paused spending: runway under 3 weeks', 'Drafted a relaunch plan for holders to vote on'],
    jobs: [['Relaunch vote', 'blocked', 0]],
    timeline: [[48, 'Launched on Pump.fun'], [6, 'Spending paused']],
  }),
  make({
    id: 'bagel', name: 'Bagel Labs', ticker: 'BAGEL', tagline: 'Research-grade carbohydrates.',
    status: 'paused', launchedAt: days(39), runwayDays: 24, treasurySol: 30.6, burnSolPerDay: 1.28,
    fees30dUsd: 27_000, marketCapUsd: 2_600_000, priceUsd: 0.0026, change24h: -0.043, holders: 5_610, volume24hUsd: 210_000,
    agent: ['Sesame', 'Cut burn and find one product that pays for itself.', 'idle'],
    log: ['Cancelled two recurring jobs', 'Asked holders which product to keep'],
    jobs: [['Holder survey', 'done', 0.2], ['Bagel of the week', 'blocked', 0]],
    timeline: [[39, 'Launched on Pump.fun'], [4, 'Spending paused']],
  }),
  make({
    id: 'rugby', name: 'Rugby', ticker: 'RUGBY', tagline: 'A sports team. Allegedly.',
    status: 'distressed', launchedAt: days(22), runwayDays: 6, treasurySol: 5.1, burnSolPerDay: 0.85,
    fees30dUsd: 4_200, marketCapUsd: 1_240_000, priceUsd: 0.00124, change24h: -0.21, holders: 3_402, volume24hUsd: 38_000,
    agent: ['Scrum', 'Hold the community together until new owners arrive.', 'offline'],
    log: ['Handed control to receivership'],
    jobs: [], timeline: [[22, 'Launched on Pump.fun'], [3, 'Entered receivership']],
  }),
  make({
    id: 'dust', name: 'Dusty Cactus', ticker: 'DUST', tagline: 'Survives on nothing. Almost.',
    status: 'distressed', launchedAt: days(35), runwayDays: 9, treasurySol: 7.8, burnSolPerDay: 0.87,
    fees30dUsd: 6_900, marketCapUsd: 870_000, priceUsd: 0.00087, change24h: -0.09, holders: 2_910, volume24hUsd: 22_000,
    agent: ['Prickle', 'Keep the lights on at minimum burn.', 'offline'],
    log: ['Volume below survival threshold for 14 days'],
    jobs: [], timeline: [[35, 'Launched on Pump.fun'], [2, 'Entered receivership']],
  }),
  make({
    id: 'shrmp', name: 'Zombie Shrimp', ticker: 'SHRMP', tagline: 'Dead, but still posting.',
    status: 'distressed', launchedAt: days(41), runwayDays: 14, treasurySol: 12.4, burnSolPerDay: 0.89,
    fees30dUsd: 11_300, marketCapUsd: 2_130_000, priceUsd: 0.00213, change24h: 0.04, holders: 7_004, volume24hUsd: 96_000,
    agent: ['Krill', 'Suspended: repeated off-mission spending.', 'offline'],
    log: ['Agent suspended by the mandate program'],
    jobs: [], timeline: [[41, 'Launched on Pump.fun'], [1, 'Entered receivership']],
  }),
  make({
    id: 'llama', name: 'Echo Llama', ticker: 'LLAMA', tagline: 'Says what you said, but louder.',
    status: 'distressed', launchedAt: days(29), runwayDays: 11, treasurySol: 9.6, burnSolPerDay: 0.87,
    fees30dUsd: 8_100, marketCapUsd: 610_000, priceUsd: 0.00061, change24h: -0.14, holders: 2_380, volume24hUsd: 17_000,
    agent: ['Alpaca', 'Waiting for new owners.', 'offline'],
    log: ['Community channel went quiet'],
    jobs: [], timeline: [[29, 'Launched on Pump.fun'], [2, 'Entered receivership']],
  }),
  make({
    id: 'velv', name: 'Velvet Worm', ticker: 'VELV', tagline: 'Soft launch, hard burn.',
    status: 'distressed', launchedAt: days(17), runwayDays: 4, treasurySol: 3.2, burnSolPerDay: 0.8,
    fees30dUsd: 2_400, marketCapUsd: 480_000, priceUsd: 0.00048, change24h: -0.27, holders: 1_870, volume24hUsd: 9_000,
    agent: ['Silk', 'Suspended: burn rate above fees for 21 days.', 'offline'],
    log: ['Burn exceeded fees for 21 days'],
    jobs: [], timeline: [[17, 'Launched on Pump.fun'], [1, 'Entered receivership']],
  }),
]

export const getCompany = (id: string) => companies.find((c) => c.id === id)

const hours = (h: number) => new Date(sampleNow + h * 3600_000).toISOString()

/** Companies for sale. NORA: from the receivership program. */
export const listings: Listing[] = [
  { companyId: 'velv', reason: 'Burn above fees for 21 days', auctionEndsAt: hours(2.24), reservePriceSol: 20, topBidSol: 31, bids: 4 },
  { companyId: 'rugby', reason: 'Developer wallet exited', auctionEndsAt: hours(6.8), reservePriceSol: 35, topBidSol: 58, bids: 7 },
  { companyId: 'llama', reason: 'Team dissolved', auctionEndsAt: hours(21.6), reservePriceSol: 30, topBidSol: 36, bids: 3 },
  { companyId: 'dust', reason: 'Volume dried up', auctionEndsAt: hours(36.4), reservePriceSol: 40, bids: 0 },
  { companyId: 'shrmp', reason: 'Agent went off-mission', auctionEndsAt: hours(61), reservePriceSol: 60, topBidSol: 92, bids: 9 },
]

/** Recent takeover bids across the market. NORA: from the auction program. */
export const bids: Bid[] = [
  { id: 'b1', bidder: 'Shellfish Partners', companyId: 'shrmp', amountSol: 92, at: at(2), plan: 'Replace the agent, relaunch as a cooking show.' },
  { id: 'b2', bidder: 'Frogbank (via DOTS)', companyId: 'rugby', amountSol: 58, at: at(5), plan: 'Merge into Frogbank as its sports brand.' },
  { id: 'b3', bidder: '7xKp…w3Qd', companyId: 'llama', amountSol: 36, at: at(9), plan: 'Voice-note bot for holders; cut burn by 60%.' },
  { id: 'b4', bidder: 'Night Owl Fund', companyId: 'velv', amountSol: 31, at: at(14), plan: 'Fashion collab, then a slow rebuild.' },
]

/** NORA: aggregates from the indexer. */
export const networkStats: NetworkStats = {
  companies: companies.length,
  treasurySol: companies.reduce((a, c) => a + c.treasurySol, 0) + 892.4,
  fees30dUsd: companies.reduce((a, c) => a + c.fees30dUsd, 0),
  avgRunwayDays: Math.round(companies.filter((c) => c.status !== 'distressed').reduce((a, c) => a + c.runwayDays, 0) / companies.filter((c) => c.status !== 'distressed').length),
  inReceivership: companies.filter((c) => c.status === 'distressed').length,
  rescueCapitalSol: 2_140,
}

/** The holding company itself. */
export const holdco = { name: 'DOTS Holdco', treasurySol: 892.4, feeShare: 0.1 }
