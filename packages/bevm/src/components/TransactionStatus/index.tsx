import { formatHashWithEllipsis } from '@/composables/utils'
import { TRANSACTION_STATUS } from '@/entities/server'
import { TRANSACTION_DETAIL_STATUS } from '@/entities/transaction'
import { Icon } from '../Icon'
import { TRANSACTION_DETAIL_STATUS_ICON_MAP } from '@/composables/constants'
import './index.scss'
import classNames from 'classnames'

interface TransactionStatusProps {
  status: TRANSACTION_STATUS
  hash?: string
  href?: string
  className?: string
}

const formatTransactionStatus = (status: TRANSACTION_STATUS) => {
  switch (status) {
    case TRANSACTION_STATUS.PENDING:
      return TRANSACTION_DETAIL_STATUS.PENDING
    case TRANSACTION_STATUS.SUCCEED:
      return TRANSACTION_DETAIL_STATUS.COMPLETE
    case TRANSACTION_STATUS.PROCESSING:
      return TRANSACTION_DETAIL_STATUS.PENDING
    default:
      return TRANSACTION_DETAIL_STATUS.FAILED
  }
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, hash, href, className }) => {
  const _status = formatTransactionStatus(status)

  const Label = () => {
    if (hash != null) {
      return <a href={href} target='_blank' rel="noreferrer">{formatHashWithEllipsis(hash)}</a>
    }
    switch (_status) {
      case TRANSACTION_DETAIL_STATUS.PENDING:
        return <span>Waiting</span>
      case TRANSACTION_DETAIL_STATUS.FAILED:
        return <span>Failed</span>
      case TRANSACTION_DETAIL_STATUS.COMPLETE:
        return <span>Complete</span>
    }
  }

  return (
    <div className={classNames('oooo-transaction-status', className)}>
      <Icon className='oooo-transaction-status__icon' name={TRANSACTION_DETAIL_STATUS_ICON_MAP[_status]} />
      <Label />
    </div>
  )
}
