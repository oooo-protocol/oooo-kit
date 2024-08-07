export enum SERVER_ASSET {
  COIN = 'coin',
  TOKEN = 'erc20'
}

export interface ServerToken {
  tokenId: number
  tokenName: string
  icon: string
  chainName: string
  assetCode: string
  assetType: SERVER_ASSET
  frontDecimal: number
  tokenDecimal: number
  contractAddress: string
  platformAddress: string
  reg: string
}

export interface ServerTokenPairConfig {
  pairId: number
  minAmount: number
  maxAmount: number
  feeSaveTips: string
  timeSpendTips: string
  timeSaveTips: string
  toMaxPrice: string
}

export interface ServerTokenPair extends ServerTokenPairConfig {
  fromTokenId: number
  fromChainName: string
  fromAssetCode: string
  fromAssetType: SERVER_ASSET
  toTokenId: number
  toChainName: string
  toAssetCode: string
  toAssetType: SERVER_ASSET
}

export enum SERVER_CHAIN_TYPE {
  ON_CHAIN = 'blockchain',
  CEX = 'cex'
}

export interface ChainConfig {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export interface ServerChain {
  icon: string
  chainName: string
  showName: string
  chainType: SERVER_CHAIN_TYPE
  nativeSymbol: string
  chainConfig: ChainConfig
  rpcUrls?: string[]
  confirmBlockNum: number
  blockExplorerUrls: string[]
}

export interface ServerConfigs {
  chainList: ServerChain[]
  tokenList: ServerToken[]
  txPairList: ServerTokenPair[]
}

export enum TRANSACTION_STATUS {
  PENDING = 0,
  PROCESSING = 1,
  FAILED = -1,
  SUCCEED = 10,
  CLOSED = 20,
  REFUNDED = 21,
  TIMEOUT = 22
}

export interface Transaction {
  createTime: string
  fromChainName: string
  fromAssetType: string
  fromAssetCode: string
  fromWalletAddr: string
  fromTxnHash: string
  fromSwapAmount: string
  fromStatus: TRANSACTION_STATUS
  toChainName: string
  toAssetType: string
  toAssetCode: string
  toStatus: TRANSACTION_STATUS
  toWalletAddr: string
  toSwapAmount: string
  toTxnHash?: string
  platformAddr?: string
  platformName?: string
  binancePayOrder?: BinancePayOrder
}

export interface BinancePayOrder {
  prepayId: string
  expireTime: number
  qrcodeLink: string
  qrContent: string
  checkoutUrl: string
  deeplink: string
  universalUrl: string
  totalFee: string
  currency: string
}

export interface AmountConfig {
  fromAmount: string
  platformFee: string
  actualPlatformFee: string
  discount: string
  save: string
  toAmount: string
  timeSpendTips: string
  platformFeeUSD: string
  actualPlatformFeeUSD: string
}

export interface TransactionConfig {
  platformAddress: string
  chain: string
  gasPrice: string
  asetType: string
  assetCode: string
}
