import React from 'react'
import ReactDOM from 'react-dom/client'
import { OBridgeElement, OBridgeHistory } from '@/index'
import { ConfigProvider, App as AntdApp, Button, Divider } from 'antd'

export const App = () => {
  const [account, setAccount] = useState()
  const [loading, setLoading] = useState(false)

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

  return (
    <>
      <Button loading={loading} onClick={onConnect}>Connect</Button>
      <Divider />
      <h2>OBridgeElement</h2>
      <Divider />
      <OBridgeElement
        walletAddress={account}
        // @ts-expect-error 临时测试写死
        provider={window.ethereum}
        options={{ appId: 'BevmBridge' }}
      />
      <h2>OBridgeHistory</h2>
      <Divider />
      <OBridgeHistory
        walletAddress={account}
        // @ts-expect-error 临时测试写死
        provider={window.ethereum}
        options={{ appId: 'BevmBridge' }}
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
