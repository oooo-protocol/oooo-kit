import { TransactionStatus } from '@/components'
import { type TRANSACTION_STATUS } from '@/entities/server'
import './index.scss'

export const SwapCell: React.FC<{
  amount: string | number
  assetCode: string
  image: string
  subImage?: string
  status: TRANSACTION_STATUS
  txnHash?: string
  href?: string
}> = ({
  amount, assetCode, image, subImage, status, txnHash, href
}) => {
  return (
    <div className='oooo-history-cell'>
      <div className='oooo-history-cell__images'>
        <img className='oooo-history-cell__image' src={image} />
        {subImage != null ? <img className='oooo-history-cell__subImage' src={subImage} /> : null}
      </div>
      <div className='oooo-history-cell__content'>
        <p className='oooo-history-cell__title'>{amount} {assetCode}</p>
        <TransactionStatus status={status} hash={txnHash} href={href} />
      </div>
    </div>
  )
}
