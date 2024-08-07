import classNames from 'classnames'
import './index.scss'

export interface IconProps extends React.HTMLAttributes<SVGAElement> {
  name: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  className
}) => {
  return (
    <svg className={classNames('oooo-icon', className)} aria-hidden="true">
      <use xlinkHref={`#icon-${name}`}></use>
    </svg>
  )
}
