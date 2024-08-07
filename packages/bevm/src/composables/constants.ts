import { TRANSACTION_DETAIL_STATUS } from '@/entities/transaction'

export const TRANSACTION_DETAIL_STATUS_ICON_MAP = {
  [TRANSACTION_DETAIL_STATUS.PENDING]: 'waiting',
  [TRANSACTION_DETAIL_STATUS.COMPLETE]: 'success',
  [TRANSACTION_DETAIL_STATUS.FAILED]: 'failed1'
}

export enum CHAIN {
  BINANCE_CEX = 'binance',
  BINANCE_PAY = 'binance_pay',
}
