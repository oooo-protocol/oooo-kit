import './index.scss'
import classNames from 'classnames'
import { type AmountConfig } from '@/entities/server'
import useSWR from 'swr'
import { useOConfig } from '@/composables/oooo-config'
import { retrieveSwapAmountConfig } from '@/request/api/swap'
import { OSpin } from '@/components'

interface AmountRadioProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  fromAssetCode?: string
  toAssetCode?: string
  onChange?: (amount: AmountConfig) => void
}

export const AmountRadio: React.FC<AmountRadioProps> = ({
  className,
  fromAssetCode,
  toAssetCode,
  onChange
}) => {
  const { options: { appId } } = useOConfig()

  const { data: amounts } = useSWR(
    (fromAssetCode != null && toAssetCode != null) ? ['/v1/bridge/swap/amounts/config', fromAssetCode, toAssetCode] : null,
    async ([_, fromAssetCode, toAssetCode]) => await retrieveSwapAmountConfig({ fromAssetCode, toAssetCode, merchantNo: appId })
  )
  const [selected, setSelected] = useState<string>()

  useEffect(() => {
    if (selected != null || amounts == null) return
    onItemChange(amounts[0])
  }, [amounts])

  const onItemChange = (item: AmountConfig) => {
    setSelected(item.fromAmount)
    onChange?.(item)
  }

  return (
    <OSpin spinning={amounts == null}>
      <div className={classNames('oooo-amount-radios', className)}>
        {amounts?.map(item => (
          <div className={classNames('oooo-amount-radio', selected === item.fromAmount ? 'oooo-amount-radio--selected' : null)} key={item.fromAmount} onClick={() => { onItemChange(item) }}>
            <p className='oooo-amount-radio__value'>{item.fromAmount} {fromAssetCode}</p>
            <p className='oooo-amount-radio__estimate'>
              Get ~{item.toAmount}
            </p>
          </div>
        ))}
      </div>
    </OSpin>
  )
}
