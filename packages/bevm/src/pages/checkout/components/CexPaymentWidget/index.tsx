import { App } from 'antd'
import './index.scss'
import { type PaymentParameter } from '../PaymentWidget'
import { createTransaction, type createTransactionParameter } from '@/request/api/swap'
import { useWallet } from '@/composables/hooks/use-wallet'
import { useOConfig } from '@/composables/oooo-config'
import { formatEtherError } from '@/composables/utils'
import { type EthersError } from 'ethers'
import { BinancePayWidget, type BinancePayWidgetProps } from '../BinancePayWidget'
import { OBridgeError } from '@/entities/error'

export interface CexPaymentWidgetRef {
  create: (data: PaymentParameter) => Promise<void>
  reset: () => void
}

export const CexPaymentWidget = forwardRef<CexPaymentWidgetRef>((_, ref) => {
  const { walletAddress, options: { appId, showMessageAlert }, onFailed: OBridgeFailed } = useOConfig()
  const { sign } = useWallet()
  const [parameter, setParameter] = useState<BinancePayWidgetProps>()
  const { message } = App.useApp()

  if (walletAddress == null) {
    throw new Error('[@oooo-kit/bevm]: Wallet Address is empty')
  }

  const create = useCallback(async (data: PaymentParameter) => {
    try {
      const { chainConfig, contractAddress, fromAssetIcon, ...params } = data

      const signContent = JSON.stringify({
        ...params,
        fromAddress: walletAddress,
        toAddress: walletAddress,
        timestamp: +new Date()
      })
      const signature = await sign(signContent)
      const parameter: createTransactionParameter = {
        ...params,
        fromAddress: walletAddress,
        toAddress: walletAddress,
        signContent,
        signature,
        publicKey: walletAddress,
        merchantNo: appId
      }

      const transaction = await createTransaction(parameter)
      setParameter({
        fromAssetIcon,
        fromChain: transaction.fromChainName,
        fromAssetType: transaction.fromAssetType,
        fromAssetCode: transaction.fromAssetCode,
        fromTxnHash: transaction.fromTxnHash,
        fromWalletAddr: transaction.fromWalletAddr
      })
    } catch (e) {
      const error = e as EthersError
      const formatedError = formatEtherError(e as EthersError) as Error
      OBridgeFailed?.(new OBridgeError(formatedError.message, error))
      if (showMessageAlert) {
        void message.open({ type: 'error', content: formatedError.message })
      }
      throw e
    }
  }, [OBridgeFailed, appId, message, showMessageAlert, sign, walletAddress])

  useImperativeHandle(ref, () => ({
    create,
    reset () {
      setParameter(undefined)
    }
  }), [create])

  if (parameter == null) return

  return <BinancePayWidget {...parameter} />
})
