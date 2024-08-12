import { useWallet } from '@/composables/hooks/use-wallet'
import { useOConfig } from '@/composables/oooo-config'
import { SERVER_ASSET, type Transaction } from '@/entities/server'
import { createTransaction, retrieveTransactionConfig, type createTransactionParameter } from '@/request/api/swap'
import classNames from 'classnames'
import { type PaymentParameter } from '../PaymentWidget'
import './index.scss'
import { TransferProcessingModal } from '../TransferProcessingModal'
import { Icon } from '@/components'
import { App } from 'antd'
import { type EthersError } from 'ethers'
import { formatEtherError } from '@/composables/utils'
import { PaymentDetailModal } from '../PaymentDetailModal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { OBridgeError } from '@/entities/error'
import { Navigate } from 'react-router-dom'

export interface ChainPaymentWidgetRef {
  create: (data: PaymentParameter) => Promise<void>
}

export const ChainPayingModal = NiceModal.create<{ paymentInfo: PaymentParameter }>(({ paymentInfo }) => {
  const modal = useModal()

  return (
    <TransferProcessingModal
      className={classNames(
        'oooo-chain-payment-widget'
      )}
      open={modal.visible}
      onCancel={modal.hide}
      afterClose={modal.remove}
    >
      <div className='oooo-chain-payment-widget__tokens'>
        <div className='oooo-chain-payment-widget__token'>
          <img src={paymentInfo.fromAssetIcon} />
          {paymentInfo.amount} {paymentInfo.fromAssetCode}
        </div>
        <Icon className='oooo-chain-payment-widget__to' name='to' />
        <div className='oooo-chain-payment-widget__token'>
          <img src='https://oooo.money/static/images/btc.png' />
          {paymentInfo.toAmount} {paymentInfo.toAssetCode}
        </div>
      </div>
      <div className='oooo-chain-payment-widget__info'>
        <Icon className='oooo-chain-payment-widget__to' name='info' />
        <p>Please do not close this page after successful transfer, wait for processing by oooo. Don&apos;t change network settings to avoid wrong transactions. You&apos;re responsible for any money lost from this.</p>
      </div>
      <p className='oooo-chain-payment-widget__hint'>
            Requires Your Operation in the Wallet
      </p>
    </TransferProcessingModal>
  )
})

export const ChainPaymentWidget = forwardRef<ChainPaymentWidgetRef>((_, ref) => {
  const { walletAddress, options: { appId, showMessageAlert }, onFailed: OBridgeFailed, onSuccess: OBridgeSuccess } = useOConfig()
  const { sign, switchToChain, transfer, getBalance } = useWallet()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const chainPayingModal = useModal(ChainPayingModal)

  const create = useCallback(async (data: PaymentParameter) => {
    try {
      void chainPayingModal.show({
        paymentInfo: data
      })

      const { chainConfig, contractAddress, fromAssetIcon, ...params } = data

      if (chainConfig == null) throw new Error('Chain config is not provide, please check it.')

      await switchToChain(chainConfig)

      const balance = await getBalance(walletAddress!, chainConfig, contractAddress)

      if (Number(balance) < Number(data.amount)) {
        throw new Error('INSUFFICIENT FUNDS')
      }

      const signContent = JSON.stringify({
        ...params,
        fromAddress: walletAddress,
        toAddress: walletAddress,
        timestamp: +new Date()
      })
      const signature = await sign(signContent)
      const parameter: createTransactionParameter = {
        ...params,
        fromAddress: walletAddress!,
        toAddress: walletAddress,
        signContent,
        signature,
        publicKey: walletAddress!,
        merchantNo: appId
      }

      const { gasPrice, platformAddress } = await retrieveTransactionConfig({
        pairId: parameter.pairId,
        fromChain: parameter.fromChain,
        fromAddress: parameter.fromAddress,
        fromAmount: parameter.amount,
        toChain: parameter.toChain,
        toAddress: parameter.toAddress!
      })

      const transferParameter = {
        from: parameter.fromAddress,
        to: platformAddress,
        gas: gasPrice,
        value: parameter.amount
      }
      let hash: string
      if (params.fromAssetType === SERVER_ASSET.TOKEN) {
        hash = await transfer(transferParameter, chainConfig, contractAddress)
      } else {
        hash = await transfer(transferParameter, chainConfig)
      }
      const transaction = await createTransaction({
        ...parameter,
        txnHash: hash
      })
      void chainPayingModal.hide()
      const tx = await NiceModal.show(PaymentDetailModal, {
        fromChain: transaction.fromChainName,
        fromTxnHash: transaction.fromTxnHash,
        fromAssetIcon,
        fromAssetType: transaction.fromAssetType,
        fromAssetCode: transaction.fromAssetCode,
        fromWalletAddr: walletAddress,
        merchantNo: appId,
        onSuccessClose () {
          navigate(-1)
        }
      })
      OBridgeSuccess?.(tx as Transaction)
    } catch (e) {
      const error = e as EthersError
      const formatedError = formatEtherError(e as EthersError) as Error
      OBridgeFailed?.(new OBridgeError(formatedError.message, error))
      if (showMessageAlert) {
        void message.open({ type: 'error', content: formatedError.message })
      }
      throw e
    } finally {
      void chainPayingModal.hide()
    }
  }, [OBridgeFailed, OBridgeSuccess, appId, chainPayingModal, getBalance, message, navigate, showMessageAlert, sign, switchToChain, transfer, walletAddress])

  useImperativeHandle(ref, () => ({
    create
  }), [create])

  if (walletAddress == null) {
    return <Navigate to="/" replace />
  }

  return null
})
