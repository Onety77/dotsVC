import { useSyncExternalStore } from 'react'
import { holdco, sampleNow } from '@/data/network'

/*
  Two tiny shared stores, so every clock and every holdco figure on a page moves together.
*/

const loadedAt = Date.now()
const compute = () => sampleNow + Math.floor((Date.now() - loadedAt) / 1000) * 1000
let now = compute()
const clockSubs = new Set<() => void>()
let timer: number | undefined

function subscribeClock(cb: () => void) {
  clockSubs.add(cb)
  if (timer === undefined) {
    now = compute()
    timer = window.setInterval(() => {
      now = compute()
      clockSubs.forEach((f) => f())
    }, 1000)
  }
  return () => {
    clockSubs.delete(cb)
    if (!clockSubs.size && timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}

/** The sample clock right now, for stamping things you do (a bid). */
export const sampleNowMs = () => compute()

/** "Now" for the sample data, ticking once a second. One interval for the whole page. */
export const useNow = () => useSyncExternalStore(subscribeClock, () => now)

let holdcoSol = holdco.treasurySol
const holdcoSubs = new Set<() => void>()

/** Called when a fee pulse reaches the holdco. */
export function addToHoldco(sol: number) {
  holdcoSol += sol
  holdcoSubs.forEach((f) => f())
}

export const useHoldcoTreasury = () =>
  useSyncExternalStore(
    (cb) => {
      holdcoSubs.add(cb)
      return () => {
        holdcoSubs.delete(cb)
      }
    },
    () => holdcoSol,
  )

/** A bid you placed this session. */
export interface MyBid {
  companyId: string
  amountSol: number
  plan: string
  agent: 'bring' | 'dots' | 'keep'
  at: number
}

let myBids: MyBid[] = []
const bidSubs = new Set<() => void>()

/** Your latest bid replaces your earlier one on the same company. */
export function placeBid(b: MyBid) {
  myBids = [...myBids.filter((x) => x.companyId !== b.companyId), b]
  bidSubs.forEach((f) => f())
}

export const useMyBids = () =>
  useSyncExternalStore(
    (cb) => {
      bidSubs.add(cb)
      return () => {
        bidSubs.delete(cb)
      }
    },
    () => myBids,
  )
