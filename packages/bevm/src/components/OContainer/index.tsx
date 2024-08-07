import classNames from 'classnames'
import { Icon } from '../Icon'
import './index.scss'

interface OContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  isSupportBack?: boolean
}

export const OContainer: React.FC<OContainerProps> = ({
  className,
  children,
  isSupportBack = true,
  ...props
}) => {
  const navigate = useNavigate()

  return (
    <div className={classNames('oooo-container', className)} {...props}>
      {isSupportBack
        ? (
          <p className='oooo-container__back' onClick={() => { navigate(-1) }}>
            {'<'} Back
          </p>
        )
        : null}
      {children}
      <div className='oooo-footer'>
        <p className='oooo-footer__text'>Gas service is provided by</p>
        <Icon className='oooo-footer__logo' name='logo' />
      </div>
    </div>
  )
}
