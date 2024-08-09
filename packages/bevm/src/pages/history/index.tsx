import { OContainer } from '@/components'
import './index.scss'
import { ConfigProvider, Empty, Table, type TablePaginationConfig, type TableColumnsType } from 'antd'
import { StatusLabel } from './components/StatusLabel'
import EmptyImage from '@/assets/images/empty.png'
import useSWR from 'swr'
import { retrieveTransactionList } from '@/request'
import { useOConfig } from '@/composables/oooo-config'
import { TRANSACTION_STATUS, type Transaction } from '@/entities/server'
import { TRANSACTION_DETAIL_STATUS } from '@/entities/transaction'
import { SwapCell } from './components/SwapCell'
import dayjs from 'dayjs'
import { retrieveSwapConfigs } from '@/request/api/swap'
import { defineMap } from '@preflower/utils'
import { combineURLs, isCexChain } from '@/composables/utils'
import { useWindowSize } from 'react-use'

const TableEmpty = () => (
  <Empty className='oooo-history__empty' image={EmptyImage} />
)

const getTransactionStatus = (transaction?: Transaction) => {
  if (transaction == null) return TRANSACTION_DETAIL_STATUS.PENDING
  switch (transaction.fromStatus) {
    case TRANSACTION_STATUS.PENDING:
      return TRANSACTION_DETAIL_STATUS.PENDING
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.CLOSED:
    case TRANSACTION_STATUS.REFUNDED:
    case TRANSACTION_STATUS.TIMEOUT:
      return TRANSACTION_DETAIL_STATUS.FAILED
    case TRANSACTION_STATUS.PROCESSING:
      return TRANSACTION_DETAIL_STATUS.PENDING
  }
  switch (transaction.toStatus) {
    case TRANSACTION_STATUS.PENDING:
      return TRANSACTION_DETAIL_STATUS.PENDING
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.CLOSED:
    case TRANSACTION_STATUS.REFUNDED:
    case TRANSACTION_STATUS.TIMEOUT:
      return TRANSACTION_DETAIL_STATUS.FAILED
    case TRANSACTION_STATUS.PROCESSING:
      return TRANSACTION_DETAIL_STATUS.PENDING
  }
  return TRANSACTION_DETAIL_STATUS.COMPLETE
}

function History () {
  const columns: TableColumnsType<Transaction> = [
    {
      title: 'Status',
      dataIndex: 'name',
      key: 'name',
      render: (_, transaction) => <StatusLabel status={getTransactionStatus(transaction)} />
    },
    {
      title: 'From',
      key: 'from',
      render: (_, transaction) => (
        <SwapCell
          amount={Number(transaction.fromSwapAmount)}
          assetCode={transaction.fromAssetCode}
          status={transaction.fromStatus}
          image={getTransactionAssetImage(transaction)}
          subImage={getTransactionChainImage(transaction)}
          txnHash={isCexChain(transaction.fromChainName) ? undefined : transaction.fromTxnHash}
          href={getTransactionChainHref(transaction.fromChainName, transaction.fromTxnHash)}
        />
      )
    },
    {
      title: 'To',
      key: 'to',
      render: (_, transaction) => (
        <SwapCell
          amount={Number(transaction.toSwapAmount)}
          assetCode={transaction.toAssetCode}
          status={transaction.toStatus}
          image='https://oooo.money/static/images/btc.png'
          subImage='https://oooo.money/static/images/bevm.png'
          txnHash={transaction.toTxnHash}
          href={getTransactionChainHref(transaction.toChainName, transaction.toTxnHash)}
        />
      )
    },
    {
      title: 'Time',
      key: 'time',
      dataIndex: 'createTime',
      render: (createTime) => (
        <div className='oooo-history-date'>
          <p>{dayjs(createTime).format('YYYY/MM/DD')}</p>
          <p className='oooo-history-date__time'>{dayjs(createTime).format('HH:mm:ss')}</p>
        </div>
      )
    }
  ]
  const { walletAddress, options: { appId } } = useOConfig()

  const { width } = useWindowSize()
  const PAGINATION_SIZE = useMemo(() => width >= 768 ? 'default' : 'small', [width])

  const PAGE_SIZE = 5
  const [current, setCurrent] = useState(1)
  const { data: configs } = useSWR(
    ['/v1/bridge/global/configuration'],
    async () => await retrieveSwapConfigs({ merchantNo: appId }),
    {
      revalidateOnFocus: false
    }
  )
  const CHAIN_MAP = useMemo(() => configs ? defineMap(configs.chainList, 'chainName', ['icon', 'blockExplorerUrls']) : {}, [configs])
  const ASSET_MAP = useMemo(() => configs ? defineMap(configs.tokenList, 'assetCode', 'icon') : {}, [configs])

  const { isLoading, data } = useSWR(
    walletAddress != null ? ['/v1/bridge/transaction/list', walletAddress, appId, current, PAGE_SIZE] : null,
    async ([_, fromWalletAddr, merchantNo, page, size]) => await retrieveTransactionList({ fromWalletAddr, merchantNo, page, size })
  )
  const list = useMemo(() => {
    if (!configs) return undefined
    if (!data) return undefined
    return data.list
  }, [configs, data])
  const loading = useMemo(() => {
    if (!configs) return true
    return isLoading
  }, [configs, isLoading])

  const getTransactionChainImage = (transaction: Transaction) => {
    return CHAIN_MAP[transaction.fromChainName].icon
  }

  const getTransactionChainHref = (chainName: string, txnHash?: string) => {
    if (txnHash == null) return
    const chain = CHAIN_MAP[chainName]
    if (chain?.blockExplorerUrls == null) return
    return combineURLs(chain.blockExplorerUrls[0], `/tx/${txnHash}`)
  }

  const getTransactionAssetImage = (transaction: Transaction) => {
    return ASSET_MAP[transaction.fromAssetCode]
  }

  const onTableChange = (pagination: TablePaginationConfig) => {
    setCurrent(pagination.current ?? 1)
  }

  return (
    <OContainer isSupportBack={false}>
      <div className="oooo-history">
        <p className='oooo-history__title'>
          Gas History
        </p>
        <ConfigProvider renderEmpty={TableEmpty}>
          <Table
            className='oooo-history__table'
            pagination={{
              current,
              total: data?.totalCount,
              pageSize: PAGE_SIZE,
              showTotal: (total) => `total ${total} items`,
              size: PAGINATION_SIZE
            }}
            columns={columns}
            dataSource={list}
            onChange={onTableChange}
            loading={loading}
            rowKey={(transaction) => transaction.fromTxnHash}
          />
        </ConfigProvider>
      </div>
    </OContainer>
  )
}

export default History
