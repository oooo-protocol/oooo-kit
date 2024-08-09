import { TRANSACTION_DETAIL_STATUS } from '@/entities/transaction'
import useSWR from 'swr'
import { retrieveSwapConfigs, retrieveTransactionDetail } from '@/request/api/swap'
import { type Transaction, TRANSACTION_STATUS } from '@/entities/server'
import { Icon, OSpin, OSpinPlaceholder, TransactionStatus } from '@/components'
import { combineURLs, isCexChain } from '@/composables/utils'
import './index.scss'
import { TransferProcessingModal } from '../TransferProcessingModal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { defineMap } from '@preflower/utils'

const getTransactionDetailStatus = (data?: Transaction) => {
  if (data == null) return TRANSACTION_DETAIL_STATUS.PENDING
  switch (data.fromStatus) {
    case TRANSACTION_STATUS.PENDING:
      return TRANSACTION_DETAIL_STATUS.PENDING
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.CLOSED:
    case TRANSACTION_STATUS.REFUNDED:
    case TRANSACTION_STATUS.TIMEOUT:
      return TRANSACTION_DETAIL_STATUS.FAILED
    case TRANSACTION_STATUS.PROCESSING:
      return TRANSACTION_DETAIL_STATUS.PENDING
  }
  switch (data.toStatus) {
    case TRANSACTION_STATUS.PENDING:
      return TRANSACTION_DETAIL_STATUS.PENDING
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.CLOSED:
    case TRANSACTION_STATUS.REFUNDED:
    case TRANSACTION_STATUS.TIMEOUT:
      return TRANSACTION_DETAIL_STATUS.FAILED
    case TRANSACTION_STATUS.PROCESSING:
      return TRANSACTION_DETAIL_STATUS.PENDING
  }
  return TRANSACTION_DETAIL_STATUS.COMPLETE
}

interface ChainPaymentDetailProps {
  fromChain: string
  fromTxnHash: string
  fromAssetIcon: string
  fromAssetType: string
  fromAssetCode: string
  fromWalletAddr: string
  merchantNo: string
  onSucceed?: (transaction: Transaction) => void
  onFailed?: (e: Error) => void
}

export const PaymentDetail: React.FC<ChainPaymentDetailProps> = ({ onSucceed, onFailed, merchantNo, ...props }) => {
  const { data: configs } = useSWR(
    ['/v1/bridge/global/configuration'],
    async () => await retrieveSwapConfigs({ merchantNo })
  )
  const CHAIN_MAP = useMemo(() => configs ? defineMap(configs.chainList, 'chainName', ['icon', 'blockExplorerUrls']) : {}, [configs])

  const getTransactionChainHref = (chainName: string, txnHash?: string) => {
    if (txnHash == null) return
    const chain = CHAIN_MAP[chainName]
    if (chain?.blockExplorerUrls == null) return
    return combineURLs(chain.blockExplorerUrls[0], `/tx/${txnHash}`)
  }

  const { data } = useSWR(
    ['/v1/bridge/transaction/detail', props],
    async ([_, props]) => await retrieveTransactionDetail(props),
    {
      refreshInterval: (transaction) => {
        const currentStatus = getTransactionDetailStatus(transaction)
        /**
         * FROM_CONFIRMED_ON_CHAIN, TO_WAIT_DELIVERED, TO_CONFIRMED_ON_CHAIN
         * Polling be trigger if server return above status
         */
        if (
          currentStatus === TRANSACTION_DETAIL_STATUS.PENDING
        ) {
          return 3000
        }
        return 0
      },
      onSuccess (transaction) {
        const currentStatus = getTransactionDetailStatus(transaction)
        if (currentStatus === TRANSACTION_DETAIL_STATUS.COMPLETE) {
          onSucceed?.(transaction)
        }
        if (currentStatus === TRANSACTION_DETAIL_STATUS.FAILED) {
          onFailed?.(new Error('Transaction failed, please contact to deal with it.'))
        }
      },
      revalidateOnFocus: false
    }
  )
  const status = useMemo(() => getTransactionDetailStatus(data), [data])

  const DetailStatusIcon = () => {
    if (status === TRANSACTION_DETAIL_STATUS.PENDING) {
      return <div className='oooo-payment-detail__status'><OSpin /></div>
    } else if (status === TRANSACTION_DETAIL_STATUS.COMPLETE) {
      return <div className='oooo-payment-detail__status oooo-payment-detail__status--succeed'><Icon name='success-large' /></div>
    } else {
      return <Icon className='oooo-payment-detail__status oooo-payment-detail__status--failed' name='failed' />
    }
  }

  if (data == null) {
    return (
      <div className='oooo-payment-detail'>
        <OSpinPlaceholder height={160} />
      </div>
    )
  }

  return (
    <div className='oooo-payment-detail'>
      <DetailStatusIcon />
      <div className='oooo-payment-detail__tokens'>
        <div className='oooo-payment-detail__from'>
          <div className='oooo-payment-detail__token'>
            <img src={props.fromAssetIcon} />
            {Number(data.fromSwapAmount)} {data.fromAssetCode}
          </div>
          <TransactionStatus status={data.fromStatus} hash={isCexChain(data.fromChainName) ? undefined : data.fromTxnHash} href={getTransactionChainHref(data.fromChainName, data.fromTxnHash)} />
        </div>
        <Icon className='oooo-payment-detail__arrow' name='to' />
        <div className='oooo-payment-detail__to'>
          <div className='oooo-payment-detail__token'>
            <img src='https://oooo.money/static/images/btc.png' />
            {Number(data.toSwapAmount)} {data.toAssetCode}
          </div>
          {data.toTxnHash != null && data.toTxnHash !== ''
            ? (
              <TransactionStatus
                status={data.toStatus}
                hash={data.toTxnHash}
                href={getTransactionChainHref(data.toChainName, data.toTxnHash)}
              />
            )
            : null}
        </div>
      </div>
    </div>
  )
}

export const PaymentDetailModal = NiceModal.create<ChainPaymentDetailProps & { onSuccessClose?: () => void }>(({
  onSuccessClose,
  ...props
}) => {
  const modal = useModal()
  const [isSucceed, setSucceed] = useState(false)

  const onCancel = async () => {
    void modal.hide()
    if (isSucceed) {
      onSuccessClose?.()
    }
  }

  const onSucceed = (transaction: Transaction) => {
    setSucceed(true)
    modal.resolve(transaction)
  }

  const onFailed = (e: Error) => {
    modal.reject(e)
  }

  return (
    <TransferProcessingModal open={modal.visible} onCancel={onCancel} afterClose={modal.remove}>
      <PaymentDetail
        onSucceed={onSucceed}
        onFailed={onFailed}
        {...props}
      />
    </TransferProcessingModal>
  )
})
