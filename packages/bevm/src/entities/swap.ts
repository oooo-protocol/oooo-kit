import { type ServerTokenPair, type ServerToken, type ServerChain, type ChainConfig } from './server'

export type Asset = Pick<ServerToken, 'assetCode' | 'assetType' | 'icon'>

export interface AssetPairConfig {
  txPairs: TxPairConfig[]
}

export interface TxPairConfig {
  pairId: ServerTokenPair['pairId']
  fromAssetIcon: ServerToken['icon']
  fromAssetCode: ServerTokenPair['fromAssetCode']
  fromAssetType: ServerTokenPair['fromAssetType']
  fromChainIcon: ServerChain['icon']
  fromChainName: ServerTokenPair['fromChainName']
  fromChainShowName: ServerChain['showName']
  toAssetCode: ServerTokenPair['toAssetCode']
  toAssetType: ServerTokenPair['toAssetType']
  toChainName: ServerTokenPair['toChainName']
  chainConfig: ChainConfig
  contractAddress: ServerToken['contractAddress']
}
