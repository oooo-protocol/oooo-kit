import { OContainer, TooltipCell } from '@/components'
import './index.scss'
import useSWR from 'swr'
import { reteieveEstimateSwapFee } from '@/request/api/swap'
import { type AssetPairConfig } from '@/entities/swap'
import { OSpin } from '@/components/OSpin'
import { formatHashWithEllipsis } from '@/composables/utils'
import { PairItem } from './components/PairItem'
import { CHAIN } from '@/composables/constants'
import { PaymentWidget, type PaymentWidgetRef } from './components/PaymentWidget'
import { useOConfig } from '@/composables/oooo-config'

interface LocationState {
  amount: string
  config: AssetPairConfig
}

function CheckoutPage () {
  const state = useLocation().state as LocationState
  const { walletAddress } = useOConfig()

  if (state.config == null) {
    throw new Error('[@oooo-kit/bevm]: Config is not passed on correctly')
  }

  if (walletAddress == null) {
    throw new Error('[@oooo-kit/bevm]: Wallet Address is empty')
  }

  const { config, amount } = state
  const chainPairList = useMemo(() => {
    return config.txPairs.filter(item => item.fromChainName !== CHAIN.BINANCE_CEX && item.fromChainName !== CHAIN.BINANCE_PAY)
  }, [config.txPairs])
  const cexPairList = useMemo(() => {
    return config.txPairs.filter(item => ([CHAIN.BINANCE_CEX, CHAIN.BINANCE_PAY] as string[]).includes(item.fromChainName))
  }, [config.txPairs])
  const [selectedPair, setSelectedPair] = useState(config.txPairs[0])

  const { isLoading, data: estimate } = useSWR(
    selectedPair != null ? ['/v1/bridge/global/configuration', selectedPair.pairId, amount] : null,
    async ([_, pairId, amount]) => await reteieveEstimateSwapFee({ pairId, fromAmount: amount }),
    {
      refreshInterval: 5000
    }
  )

  const paymentWidgetRef = useRef<PaymentWidgetRef>(null)

  useEffect(() => {
    paymentWidgetRef.current?.reset()
  }, [selectedPair])

  const onSubmit = () => {
    paymentWidgetRef.current?.create({
      pairId: selectedPair.pairId,
      fromAssetIcon: selectedPair.fromAssetIcon,
      fromChain: selectedPair.fromChainName,
      fromAssetType: selectedPair.fromAssetType,
      fromAssetCode: selectedPair.fromAssetCode,
      toChain: selectedPair.toChainName,
      toAssetType: selectedPair.toAssetType,
      toAssetCode: selectedPair.toAssetCode,
      contractAddress: selectedPair.contractAddress,
      chainConfig: selectedPair.chainConfig,
      amount,
      toAmount: estimate!.toAmount
    })
  }

  return (
    <OContainer>
      <OSpin spinning={isLoading}>
        <div className='oooo-checkout__header'>
          <div className='oooo-checkout__content'>
            <p className='oooo-checkout__amount'>Payment Amount: {estimate?.fromAmount} {selectedPair.fromAssetCode}</p>
            <p className='oooo-checkout__estimate'>Get ~{estimate?.toAmount} {selectedPair.toAssetCode}</p>
            <p className='oooo-checkout__fee'>
            Fee Promotion
              <span className='oooo-checkout__out'>${estimate?.platformFeeUSD}</span>
            ${estimate?.actualPlatformFeeUSD}
            </p>
          </div>
          <div className='oooo-checkout__cells'>
            <TooltipCell label='Recipient Address' message='hint message'>
              <p>{formatHashWithEllipsis(walletAddress)}</p>
            </TooltipCell>
          </div>
        </div>
      </OSpin>
      <div className='oooo-checkout-methods'>
        <div className='oooo-checkout-methods__title'>
          Chain
        </div>
        <div className='oooo-checkout-methods__content'>
          {chainPairList.map(pair => (
            <PairItem
              key={pair.pairId}
              pair={pair}
              active={selectedPair.pairId === pair.pairId}
              onClick={() => { setSelectedPair(pair) }}
            />
          ))}
        </div>
        {cexPairList.length > 0
          ? (
            <>
              <div className='oooo-checkout-methods__title'>
                Cex
              </div>
              <div className='oooo-checkout-methods__content'>
                {cexPairList.map(pair => (
                  <PairItem
                    key={pair.pairId}
                    pair={pair}
                    active={selectedPair.pairId === pair.pairId}
                    onClick={() => { setSelectedPair(pair) }}
                  />
                ))}
              </div>
            </>
          )
          : null}
      </div>
      <PaymentWidget
        ref={paymentWidgetRef}
        className='oooo-checkout__submit'
        onSubmit={onSubmit}
      />
    </OContainer>
  )
}

export default CheckoutPage
