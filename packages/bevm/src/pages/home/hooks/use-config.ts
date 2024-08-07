import { type ServerConfigs } from '@/entities/server'
import { type Asset, type AssetPairConfig } from '@/entities/swap'
import { defineMap } from '@preflower/utils'

export interface ToAsset extends Asset {
  config: AssetPairConfig
}

export interface AssetPair extends Asset {
  tos: Record<string, ToAsset>
}

type AssetPairMap = Record<string, AssetPair>

export const useConfig = (configs?: ServerConfigs) => {
  const [from, setFrom] = useState<string>()
  const [to, setTo] = useState<string>()
  const [assetPairMap, setAssetPairMap] = useState<AssetPairMap>({})
  const fromList = useMemo(() => Object.values(assetPairMap), [assetPairMap])
  const toList = useMemo(() => from != null ? Object.values(assetPairMap[from].tos) : [], [assetPairMap, from])
  const config = useMemo(() => {
    if (from != null && to != null) {
      return assetPairMap[from]?.tos[to]?.config
    }
  }, [from, to, assetPairMap])

  useEffect(() => {
    if (configs == null) return
    const tokenMap = defineMap(configs.tokenList, 'tokenId', ['icon', 'platformAddress', 'contractAddress'])
    const chainMap = defineMap(configs.chainList, 'chainName', ['icon', 'showName', 'chainConfig'])

    const pairMap = configs.txPairList.reduce<AssetPairMap>((pre, cur) => {
      let from = pre[cur.fromAssetCode]
      const fromToken = tokenMap[cur.fromTokenId]
      const fromChain = chainMap[cur.fromChainName]
      const toToken = tokenMap[cur.toTokenId]
      if (from == null) {
        from = pre[cur.fromAssetCode] = {
          assetCode: cur.fromAssetCode,
          assetType: cur.fromAssetType,
          icon: fromToken.icon,
          tos: {}
        }
      }
      let to = from.tos[cur.toAssetCode]
      if (to == null) {
        to = from.tos[cur.toAssetCode] = {
          assetCode: cur.toAssetCode,
          assetType: cur.toAssetType,
          icon: toToken.icon,
          config: {
            txPairs: []
          }
        }
      }
      const txPairs = to.config.txPairs
      txPairs.push({
        pairId: cur.pairId,
        fromAssetIcon: fromToken.icon,
        fromChainIcon: fromChain.icon,
        fromAssetCode: cur.fromAssetCode,
        fromAssetType: cur.fromAssetType,
        fromChainName: cur.fromChainName,
        fromChainShowName: fromChain.showName,
        toAssetCode: cur.toAssetCode,
        toAssetType: cur.toAssetType,
        toChainName: cur.toChainName,
        chainConfig: fromChain.chainConfig,
        contractAddress: fromToken.contractAddress
      })
      return pre
    }, {})

    setAssetPairMap(pairMap)
  }, [configs])

  useEffect(() => {
    if (fromList.length === 0) return
    if (from == null) {
      setFrom(fromList[0].assetCode)
    }
    const isInclude = fromList.some((item) => item.assetCode === from)
    if (!isInclude) {
      setFrom(fromList[0].assetCode)
    }
  }, [fromList, from])

  useEffect(() => {
    if (toList.length === 0) return
    if (to == null) {
      setTo(toList[0].assetCode)
    }
    const isInclude = toList.some((item) => item.assetCode === to)
    if (!isInclude) {
      setTo(toList[0].assetCode)
    }
  }, [toList, to])

  return {
    from,
    setFrom,
    to,
    setTo,
    fromList,
    toList,
    config
  }
}
