import { createContext, useContext } from 'react'

export interface Wallet {
  address: string | null
  /** NORA: open the Solana wallet adapter modal. The mock toggles a sample address. */
  connect: () => void
}

export const WalletCtx = createContext<Wallet>({ address: null, connect: () => {} })
export const useWallet = () => useContext(WalletCtx)
