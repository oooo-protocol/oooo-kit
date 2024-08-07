import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import routes from './router'
import { AntdConfigProvider } from './components'
import { OConfigProvider } from './composables/oooo-config'
import { type OConfig } from './composables/oooo-config/context'
import '@/styles/reset.scss'
import '@/assets/iconfont/iconfont.js'
import NiceModal from '@ebay/nice-modal-react'

export interface AppProps extends OConfig {
  initialEntries?: string[]
}

function App ({
  initialEntries = ['/'],
  ...config
}: AppProps) {
  return (
    <AntdConfigProvider>
      <OConfigProvider value={config}>
        <NiceModal.Provider>
          <div className='oooo'>
            <RouterProvider router={createMemoryRouter(routes, { initialEntries })} />
          </div>
        </NiceModal.Provider>
      </OConfigProvider>
    </AntdConfigProvider>
  )
}

export default App
