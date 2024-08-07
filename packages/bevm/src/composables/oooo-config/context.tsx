import { type Eip1193Provider } from 'ethers'
import { createContext } from 'react'

export interface OCOnfigOptions {
  appId: string
}

export interface OConfig {
  walletAddress?: string
  provider: Eip1193Provider
  options: OCOnfigOptions
}

export const OConfigContext = createContext<OConfig | null>(null)

export const useOConfig = () => {
  const context = useContext(OConfigContext)

  if (context == null) { throw new Error('useOConfig must be used within a OConfigProvider') }

  return context
}
