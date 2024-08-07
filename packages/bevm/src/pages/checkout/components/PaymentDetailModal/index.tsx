import { useOConfig } from '@/composables/oooo-config'
import { TRANSACTION_DETAIL_STATUS } from '@/entities/transaction'
import useSWR from 'swr'
import { retrieveSwapConfigs, retrieveTransactionDetail } from '@/request/api/swap'
import { type Transaction, TRANSACTION_STATUS } from '@/entities/server'
import { Icon, OSpin, OSpinPlaceholder, TransactionStatus } from '@/components'
import BEVM_IMAGE from '@/assets/images/bevm.png'
import { combineURLs } from '@/composables/utils'
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
  onSucceed?: () => void
}

export const PaymentDetail: React.FC<ChainPaymentDetailProps> = ({ onSucceed, ...props }) => {
  const { walletAddress, options: { appId } } = useOConfig()
  const [status, setStatus] = useState(TRANSACTION_DETAIL_STATUS.PENDING)

  const { data: configs } = useSWR(
    ['/v1/bridge/global/configuration'],
    async () => await retrieveSwapConfigs({ merchantNo: appId })
  )
  const CHAIN_MAP = useMemo(() => configs ? defineMap(configs.chainList, 'chainName', ['icon', 'blockExplorerUrls']) : {}, [configs])

  const getTransactionChainHref = (chainName: string, txnHash?: string) => {
    if (txnHash == null) return
    const chain = CHAIN_MAP[chainName]
    if (chain?.blockExplorerUrls == null) return
    return combineURLs(chain.blockExplorerUrls[0], `/tx/${txnHash}`)
  }

  if (walletAddress == null) {
    throw new Error('[@oooo-kit/bevm]: Wallet Address is empty')
  }

  const { data } = useSWR(
    ['/v1/bridge/transaction/detail', props],
    async ([_, props]) => await retrieveTransactionDetail({ ...props, fromWalletAddr: walletAddress }),
    {
      refreshInterval: (transaction) => {
        const currentStatus = getTransactionDetailStatus(transaction)
        /**
         * No change if server status later than local status
         */
        if (currentStatus > status) {
          setStatus(currentStatus)
        }
        /**
         * FROM_CONFIRMED_ON_CHAIN, TO_WAIT_DELIVERED, TO_CONFIRMED_ON_CHAIN
         * Polling be trigger if server return above status
         */
        if (
          status === TRANSACTION_DETAIL_STATUS.PENDING
        ) {
          return 3000
        }
        if (status === TRANSACTION_DETAIL_STATUS.COMPLETE) {
          onSucceed?.()
        }
        return 0
      },
      revalidateOnFocus: false
    }
  )

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
          <TransactionStatus status={data.fromStatus} hash={data.fromTxnHash} href={getTransactionChainHref(data.fromChainName, data.fromTxnHash)} />
        </div>
        <Icon className='oooo-payment-detail__arrow' name='to' />
        <div className='oooo-payment-detail__to'>
          <div className='oooo-payment-detail__token'>
            <img src={BEVM_IMAGE} />
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

export const PaymentDetailModal = NiceModal.create<ChainPaymentDetailProps>(({
  fromChain,
  fromTxnHash,
  fromAssetIcon,
  fromAssetType,
  fromAssetCode,
  onSucceed
}) => {
  const modal = useModal()
  const [isSucceed, setSucceed] = useState(false)

  const onCancel = async () => {
    void modal.hide()
    if (isSucceed) {
      onSucceed?.()
    }
  }

  return (
    <TransferProcessingModal open={modal.visible} onCancel={onCancel} afterClose={modal.remove}>
      <PaymentDetail
        fromChain={fromChain}
        fromTxnHash={fromTxnHash}
        fromAssetIcon={fromAssetIcon}
        fromAssetType={fromAssetType}
        fromAssetCode={fromAssetCode}
        onSucceed={() => { setSucceed(true) }}
      />
    </TransferProcessingModal>
  )
})
