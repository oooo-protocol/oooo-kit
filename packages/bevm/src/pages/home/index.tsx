import './index.scss'
import { Button } from 'antd'
import { AssetSelect } from './components/AssetSelect'
import { OContainer, TooltipCell, OSpinPlaceholder, Icon } from '@/components'
import { AmountRadio } from './components/AmountRadio'
import useSWR from 'swr'
import { retrieveSwapConfigs } from '@/request/api/swap'
import { useOConfig } from '@/composables/oooo-config'
import { useConfig } from './hooks/use-config'
import { formatHashWithEllipsis } from '@/composables/utils'
import { type AmountConfig } from '@/entities/server'

function Home () {
  const navigate = useNavigate()
  const { walletAddress, options: { appId } } = useOConfig()

  const { data: configs } = useSWR(
    ['/v1/bridge/global/configuration'],
    async () => await retrieveSwapConfigs({ merchantNo: appId })
  )
  const loading = configs == null

  const { from, to, setFrom, setTo, fromList, toList, config } = useConfig(configs)

  const [currentAmountConfig, setCurrentAmountConfig] = useState<AmountConfig>()

  const onSubmit = () => {
    if (currentAmountConfig == null) return

    navigate('/checkout', {
      state: {
        amount: currentAmountConfig.fromAmount,
        config
      }
    })
  }

  if (loading) {
    return (
      <OContainer isSupportBack={false}>
        <div className='oooo-swap'>
          <OSpinPlaceholder />
        </div>
      </OContainer>
    )
  }

  return (
    <OContainer isSupportBack={false}>
      <div className='oooo-swap'>
        <div className='oooo-swap-selects'>
          <AssetSelect
            label='From'
            className='oooo-swap-selects__item'
            value={from}
            list={fromList}
            onChange={setFrom}
          />
          <AssetSelect
            label='To'
            className='oooo-swap-selects__item'
            value={to}
            list={toList}
            onChange={setTo}
          />
        </div>
        <AmountRadio
          className='oooo-swap-amounts'
          fromAssetCode={from}
          toAssetCode={to}
          onChange={setCurrentAmountConfig}
        />
        <div className='oooo-swap-cells'>
          {config
            ? (
              <TooltipCell label='Recipient Address' message='hint'>
                <p>{walletAddress != null ? formatHashWithEllipsis(walletAddress) : '-'}</p>
              </TooltipCell>
            )
            : null}
          {currentAmountConfig
            ? (
              <>
                <TooltipCell className='oooo-swap-cells__emphasis' label='Fee Promotion' message='hint'>
                  <p>
                    <span className='oooo-swap-cells__out'>${currentAmountConfig.platformFeeUSD}</span>
                    ${currentAmountConfig.actualPlatformFeeUSD}
                  </p>
                </TooltipCell>
                <TooltipCell label='Estimated Time of Arrival' message='hint'>
                  <p>~{currentAmountConfig.timeSpendTips}</p>
                </TooltipCell>
              </>
            )
            : null}
          {walletAddress == null
            ? (
              <div className='oooo-swap-unconnect'>
                <Icon className='oooo-swap-unconnect__icon' name='info' />
                Connect BEVM Wallet
              </div>
            )
            : null}
        </div>
      </div>
      <Button
        className='oooo-swap__submit'
        type='primary'
        size='large'
        onClick={onSubmit}
        disabled={currentAmountConfig == null || walletAddress == null}
        block
      >
        Purchase
      </Button>
    </OContainer>
  )
}

export default Home
