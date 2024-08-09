import { type OBridgeError } from '@/entities/error'
import { type Transaction } from '@/entities/server'
import { type Eip1193Provider } from 'ethers'
import { createContext } from 'react'

export interface OCOnfigOptions {
  appId: string
  showMessageAlert?: boolean
}

export interface OConfig {
  walletAddress?: string
  provider: Eip1193Provider
  options: OCOnfigOptions
  onSuccess?: (transaction: Transaction) => void
  onFailed?: (error: OBridgeError) => void
}

export const OConfigContext = createContext<OConfig | null>(null)

export const useOConfig = () => {
  const context = useContext(OConfigContext)

  if (context == null) { throw new Error('useOConfig must be used within a OConfigProvider') }

  return context
}
