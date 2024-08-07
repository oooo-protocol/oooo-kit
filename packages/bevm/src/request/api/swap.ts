import { type ServerConfigs, type AmountConfig, type Transaction, type TransactionConfig } from '@/entities/server'
import instance from '../axios'

export const retrieveSwapConfigs = async (data: {
  merchantNo: string
}) => {
  return await instance<ServerConfigs>({
    url: '/v1/bridge/swap/global/configuration',
    params: data
  })
}

export const retrieveSwapAmountConfig = async (data: {
  merchantNo: string
  fromAssetCode: string
  toAssetCode: string
}) => {
  return await instance<AmountConfig[]>({
    url: '/v1/bridge/swap/amounts/config',
    params: data
  })
}

export const reteieveEstimateSwapFee = async (data: {
  pairId: number
  fromAmount: string
}) => {
  return await instance<{
    fromAmount: string
    platformFee: string
    actualPlatformFee: string
    discount: string
    save: string
    toAmount: string
    timeSpendTips: string
    platformFeeUSD: string
    actualPlatformFeeUSD: string
  }>({
    url: '/v1/bridge/swap/fee/estimate',
    params: data
  })
}

export interface createTransactionParameter {
  pairId: number
  fromChain: string
  fromAddress: string
  fromAssetType?: string
  fromAssetCode?: string
  toChain: string
  toAddress?: string
  toAssetType?: string
  toAssetCode?: string
  txnHash?: string
  amount: string
  signature: string
  signContent: string
  publicKey: string
  voucherRecordId?: number
  merchantNo: string
}

export const createTransaction = async (data: createTransactionParameter) => {
  return await instance<Transaction>({
    method: 'POST',
    url: '/v1/bridge/transfer/one',
    data
  })
}

export const retrieveTransactionConfig = async (data: {
  pairId: number
  fromChain: string
  fromAddress: string
  fromAmount: string
  fromAssetType?: string
  fromAssetCode?: string
  toChain: string
  toAddress: string
  toAssetType?: string
  toAssetCode?: string
}) => {
  return await instance<TransactionConfig>({
    url: '/v1/bridge/transfer/pre/check',
    method: 'POST',
    data
  })
}

export interface retrieveTransactionDetailParameter {
  fromChain: string
  fromAssetType?: string
  fromAssetCode?: string
  fromTxnHash: string
  fromWalletAddr: string
}

export const retrieveTransactionDetail = async (params: retrieveTransactionDetailParameter) => {
  return await instance<Transaction>({
    url: '/v1/bridge/transaction/detail',
    params
  })
}
