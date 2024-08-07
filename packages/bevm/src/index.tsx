import App, { type AppProps } from './App'

export function OBridgeElement (props: AppProps) {
  return (
    <App {...props} />
  )
}

export function OBridgeHistory (props: AppProps) {
  return (
    <App {...props} initialEntries={['/history']} />
  )
}
