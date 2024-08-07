import { type createTransactionParameter } from '@/request/api/swap'
import { Button } from 'antd'
import './index.scss'
import { type ChainConfig } from '@/entities/server'
import { ChainPaymentWidget, type ChainPaymentWidgetRef } from '../ChainPaymentWidget'
import { CexPaymentWidget, type CexPaymentWidgetRef } from '../CexPaymentWidget'
import { isCexChain } from '@/composables/utils'

interface PaymentWidgetProps {
  className: string
  onSubmit?: () => void
}

export interface PaymentParameter extends Omit<createTransactionParameter, 'fromAddress' | 'toAddress' | 'signature' | 'signContent' | 'publicKey' | 'merchantNo'> {
  chainConfig?: ChainConfig
  contractAddress: string
  fromAssetIcon: string
  toAmount: string
}

export interface PaymentWidgetRef {
  create: (data: PaymentParameter) => void
  reset: () => void
}

export const PaymentWidget = forwardRef<PaymentWidgetRef, PaymentWidgetProps>(({
  className,
  onSubmit
}, ref) => {
  const [isShowCexing, setShowCexing] = useState(false)
  const chainPaymentWidgetRef = useRef<ChainPaymentWidgetRef>(null)
  const cexPaymentWidgetRef = useRef<CexPaymentWidgetRef>(null)
  const [loading, setLoading] = useState(false)

  const create = async (data: PaymentParameter) => {
    try {
      setLoading(true)
      if (isCexChain(data.fromChain)) {
        await cexPaymentWidgetRef.current?.create(data)
        setShowCexing(true)
      } else {
        await chainPaymentWidgetRef.current?.create(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    create,
    reset () {
      setShowCexing(false)
      setLoading(false)
      cexPaymentWidgetRef.current?.reset()
    }
  }), [])

  return (
    <div className={className}>
      {!isShowCexing
        ? (
          <Button
            className='oooo-payment-widget__button'
            type='primary'
            size='large'
            loading={loading}
            disabled={loading}
            onClick={onSubmit}
            block
          >
            Purchase
          </Button>
        )
        : null}
      <CexPaymentWidget ref={cexPaymentWidgetRef} />
      <ChainPaymentWidget ref={chainPaymentWidgetRef} />
    </div>
  )
})
