import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { TransferProcessingModal } from '../TransferProcessingModal'
import { Button } from 'antd'
import './index.scss'

interface BinancePayUnableModalProps {
  onCopy?: () => void
}

export const BinancePayUnableModal = NiceModal.create<BinancePayUnableModalProps>(({ onCopy }) => {
  const modal = useModal()

  return (
    <TransferProcessingModal open={modal.visible} onCancel={modal.hide} afterClose={modal.remove}>
      <p className='oooo-binance-pay-unable__title'>Binance Pay Instructions</p>
      <p className='oooo-binance-pay-unable__description'>
        The payment link has copied, you can enter the browser and paste the link to complete the payment.
      </p>
      <div className='oooo-binance-pay-unable__image' />
      <Button
        className='oooo-binance-pay-unable__button'
        type='primary'
        block
        onClick={async () => await modal.hide()}
      >
        Back
      </Button>
      <Button className='oooo-binance-pay-unable__button' onClick={onCopy} block>Copy Payment Link</Button>
    </TransferProcessingModal>
  )
})
