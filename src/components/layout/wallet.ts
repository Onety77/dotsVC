import { createContext, useContext } from 'react'

export interface Wallet {
  address: string | null
  connect: () => void
}

export const WalletCtx = createContext<Wallet>({ address: null, connect: () => {} })
export const useWallet = () => useContext(WalletCtx)
