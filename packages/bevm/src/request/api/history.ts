import { type Transaction } from '@/entities/server'
import instance from '../axios'
import { type Pagination } from '../types'

export const retrieveTransactionList = async (data: {
  fromWalletAddr: string
  merchantNo: string
  page?: number
  size?: number
}) => {
  return await instance<Pagination<Transaction>>({
    url: '/v1/bridge/transaction/list',
    params: data
  })
}
