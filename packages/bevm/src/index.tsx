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

export type { Transaction } from '@/entities/server'
export type { OBridgeError } from '@/entities/error'
