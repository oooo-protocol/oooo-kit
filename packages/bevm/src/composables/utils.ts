import { type EthersError } from 'ethers'
import { CHAIN } from './constants'

export function formatHashWithEllipsis (hash: string, front = 6, tail = 4) {
  return `${hash.substring(0, front)}...${hash.substring(hash.length - tail)}`
}

export function formatEtherError (e: EthersError) {
  try {
    if (e.info?.error != null) {
      return e.info.error
    } else if (e.error) {
      return e.error
    } else {
      return e
    }
  } catch {
    return e
  }
}

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
export const combineURLs = (baseURL: string, relativeURL: string) => {
  return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL
}

export const isCexChain = (chain: string) => {
  return ([CHAIN.BINANCE_PAY, CHAIN.BINANCE_CEX] as string[]).includes(chain)
}
