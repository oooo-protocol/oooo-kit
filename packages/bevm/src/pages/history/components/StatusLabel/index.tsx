import { TRANSACTION_DETAIL_STATUS } from '@/entities/transaction'
import './index.scss'
import classNames from 'classnames'

interface StatusLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  status: TRANSACTION_DETAIL_STATUS
}

const STATUS_LABEL_MAP = {
  [TRANSACTION_DETAIL_STATUS.PENDING]: 'Pending',
  [TRANSACTION_DETAIL_STATUS.COMPLETE]: 'Complete',
  [TRANSACTION_DETAIL_STATUS.FAILED]: 'Failed'
}

export const StatusLabel: React.FC<StatusLabelProps> = ({
  className,
  status
}) => {
  return (
    <div className={classNames(
      'oooo-status-label',
      `oooo-status-label--${status}`,
      className)}
    >
      {STATUS_LABEL_MAP[status]}
    </div>
  )
}
