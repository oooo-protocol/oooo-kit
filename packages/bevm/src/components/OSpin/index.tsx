import { Spin, type SpinProps } from 'antd'
import './index.scss'
import classNames from 'classnames'

export type OSpinProps = Omit<SpinProps, 'indicator'>

export const OSpin: React.FC<OSpinProps> = ({
  className,
  ...props
}) => {
  return (
    <Spin className={classNames('oooo-spin', className)} indicator={<div className="oooo-spin__indicator" />} {...props} />
  )
}

export const OSpinPlaceholder: React.FC<{
  height?: number
}> = ({ height }) => {
  return (
    <OSpin>
      <div className='oooo-spin__placeholder' style={{ height }} />
    </OSpin>
  )
}
