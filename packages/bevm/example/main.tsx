import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntdApp, Button, Divider, Checkbox } from 'antd'
import { OBridgeElement, type OBridgeError, OBridgeHistory, type Transaction } from '@/index'

// import { OBridgeElement, type OBridgeError, OBridgeHistory, type Transaction } from '../dist/index'
// import '../dist/style.css'

export const App = () => {
  const [account, setAccount] = useState()
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const options = useMemo(() => ({
    appId: 'BevmBridge',
    showMessageAlert: checked
  }), [checked])

  const onConnect = async () => {
    try {
      setLoading(true)
      // @ts-expect-error Write for the test
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
    } finally {
      setLoading(false)
    }
  }

  const onDisconnect = () => {
    setAccount(undefined)
  }

  const onBridgeSuccess = (transaction: Transaction) => {
    console.log('onSuccess', transaction)
  }

  const onBridgeFailed = (e: OBridgeError) => {
    console.log('onFailed', e)
  }

  return (
    <>
      <Button loading={loading} onClick={onConnect}>Connect</Button>
      {' '}
      <Button loading={loading} onClick={onDisconnect}>Disconnect</Button>
      <h2>Options</h2>
      <Checkbox checked={checked} onChange={(e) => { setChecked(e.target.checked) }}>showMessageAlert</Checkbox>
      <Divider />
      <h2>OBridgeElement</h2>
      <Divider />
      <OBridgeElement
        walletAddress={account}
        // @ts-expect-error 临时测试写死
        provider={window.ethereum}
        options={options}
        onSuccess={onBridgeSuccess}
        onFailed={onBridgeFailed}
      />
      <h2>OBridgeHistory</h2>
      <Divider />
      <OBridgeHistory
        walletAddress={account}
        // @ts-expect-error 临时测试写死
        provider={window.ethereum}
        options={options}
        onSuccess={onBridgeSuccess}
        onFailed={onBridgeFailed}
      />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <AntdApp>
        <div style={{ margin: '80px auto', maxWidth: '742px' }}>
          <App />
        </div>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
)
