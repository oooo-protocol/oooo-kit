import { Icon, OSpinPlaceholder } from '@/components'
import { type Transaction, TRANSACTION_STATUS } from '@/entities/server'
import { retrieveTransactionDetail } from '@/request/api/swap'
import NiceModal from '@ebay/nice-modal-react'
import { Tooltip, Button, Statistic, App } from 'antd'
import classNames from 'classnames'
import useSWR from 'swr'
import { PaymentDetailModal } from '../PaymentDetailModal'
import BinancePayImage from '@/assets/images/binance_pay.png'
import BinanceScanImage from '@/assets/images/binance_scan.png'
import { BinancePayUnableModal } from '../BinancePayUnableModal'
import { useClipboard } from '@/composables/hooks/use-clipboard'
import './index.scss'

const { Countdown } = Statistic

export interface BinancePayWidgetProps {
  isSharing?: boolean
  fromChain: string
  fromTxnHash: string
  fromAssetIcon: string
  fromAssetType: string
  fromAssetCode: string
  fromWalletAddr: string
}

export const BinancePayWidget: React.FC<BinancePayWidgetProps> = ({ isSharing, ...props }) => {
  const navigate = useNavigate()
  const { copy } = useClipboard()
  const { message, notification } = App.useApp()
  const { isValidating, mutate, data: transaction } = useSWR(
    props != null ? ['/v1/bridge/transaction/detail', props] : null,
    async ([_, props]) => await retrieveTransactionDetail(props),
    {
      refreshInterval: (transaction) => {
        if (transaction == null || transaction.fromStatus === TRANSACTION_STATUS.PROCESSING || transaction.fromStatus === TRANSACTION_STATUS.PENDING) {
          return 3000
        }
        if (transaction.fromStatus === TRANSACTION_STATUS.SUCCEED) {
          void onSucceed(transaction)
        }
        if (transaction.fromStatus === TRANSACTION_STATUS.TIMEOUT) {
          onTimeEnd()
        }
        return 0
      },
      revalidateOnFocus: false
    }
  )

  const onSucceed = async (transaction: Transaction) => {
    await NiceModal.show(PaymentDetailModal, {
      fromChain: transaction.fromChainName,
      fromTxnHash: transaction.fromTxnHash,
      fromAssetIcon: props.fromAssetIcon,
      fromAssetType: transaction.fromAssetType,
      fromAssetCode: transaction.fromAssetCode,
      onSucceed () {
        navigate(-1)
      }
    })
  }

  const onClickUnable = async () => {
    void NiceModal.show(BinancePayUnableModal, {
      onCopy: onClickUnable
    })
    await copy(`${import.meta.env.VITE_BINANCE_PAY_EXTERNAL_LINK}?fromChain=${props.fromChain}&fromTxnHash=${props.fromTxnHash}&fromWalletAddr=${props.fromWalletAddr}&assetType=${props.fromAssetType}&assetCode=${props.fromAssetCode}`)
    void message.success({
      icon: <span style={{ marginRight: '6px' }}>💌</span>,
      content: 'Copied to clipboard!'
    })
  }

  const onTimeEnd = () => {
    notification.error({
      message: 'Failure',
      description: 'The order has expired, please place a new order.',
      onClose () {
        navigate(-1)
      }
    })
  }

  if (transaction?.binancePayOrder == null) {
    return <div><OSpinPlaceholder /></div>
  }

  return (
    <>
      <div
        className={classNames(
          'oooo-binance-pay'
        )}
      >
        <div className='oooo-binance-pay__header'>
          <img className='oooo-binance-pay__logo' src={BinancePayImage} />
          <div className='oooo-binance-pay__expire'>
          Payment Page Expires in
            <Countdown
              className='oooo-binance-pay__time'
              value={transaction.binancePayOrder.expireTime}
            />
          </div>
        </div>
        <div className='oooo-binance-pay__content'>
          <img className='oooo-binance-pay__qrcode' src={transaction.binancePayOrder.qrcodeLink} />
          <Tooltip
            color='#cda164'
            title={(
              <div className='oooo-binance-pay__tooltip'>
                <img style={{ width: '100%' }} src={BinanceScanImage} />
                <p>Please scan this QR code with the Binance App, and conntinue to complete the payment.</p>
              </div>
            )}
          >
            <p className='oooo-binance-pay__hint'>
            Scan to Pay with Binance App
              <Icon name='issue' className='oooo-binance-pay__issue' />
            </p>
          </Tooltip>
          <div className='oooo-binance-pay__divider'>OR</div>
          {isSharing
            ? (
              <Button
                className='oooo-binance-pay__button'
                type='primary'
                href={transaction.binancePayOrder.deeplink}
                target='_blank'
              >
              Continue on Binance App
              </Button>
            )
            : <Button className='oooo-binance-pay__button' type='primary' onClick={onClickUnable}>Continue on Binance App</Button>}
          <Button
            className='oooo-binance-pay__button'
            type='primary'
            href={`https://pay.binance.com/checkout/confirm?prepayOrderId=${transaction.binancePayOrder.prepayId}`}
            target='_blank'
          >
            Continue on Browser
          </Button>
          <p className='oooo-binance-pay__unabled' onClick={onClickUnable}>
          Unable to Complete Payment
          </p>
        </div>
      </div>
      <Button
        className='oooo-binance-pay__submit'
        type='primary'
        size='large'
        block
        loading={isValidating}
        disabled={isValidating}
        onClick={() => { void mutate() }}
      >
        I Have Paid
      </Button>
    </>
  )
}
