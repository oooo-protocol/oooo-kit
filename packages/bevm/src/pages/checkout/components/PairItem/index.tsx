import { type TxPairConfig } from '@/entities/swap'
import './index.scss'
import classNames from 'classnames'

interface PairItemProps extends React.HTMLAttributes<HTMLDivElement> {
  pair: TxPairConfig
  active?: boolean
}

export const PairItem: React.FC<PairItemProps> = ({
  className,
  pair,
  active,
  ...props
}) => {
  return (
    <div
      className={classNames(
        'oooo-pair-item',
        {
          'oooo-pair-item--active': active
        },
        className)}
      {...props}
    >
      <div className='oooo-pair-item__images'>
        <img className='oooo-pair-item__image' src={pair.fromAssetIcon} />
        <img className='oooo-pair-item__subImage' src={pair.fromChainIcon} />
      </div>
      <p className='oooo-pair-item__label'>
        {pair.fromAssetCode}_{pair.fromChainShowName}
      </p>
    </div>
  )
}
