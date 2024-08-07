import './index.scss'
import classNames from 'classnames'

interface TooltipCellProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  message: string
}

export const TooltipCell: React.FC<TooltipCellProps> = ({
  className,
  label,
  children
}) => {
  return (
    <div className={classNames('oooo-tooltip-cell', className)}>
      <p className='oooo-tooltip-cell__label'>
        {label}
      </p>

      {children}
    </div>
  )
}
