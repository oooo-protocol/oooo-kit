import { App, ConfigProvider, type ConfigProviderProps } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'

export const AntdConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  ...props
}) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#cda164',
          borderRadius: 2
        },
        components: {
          Button: {
            defaultBg: 'transparent',
            defaultHoverBg: 'transparent',
            defaultBorderColor: '#313030',
            defaultColor: '#313030',
            colorPrimary: '#313030',
            colorPrimaryHover: '#313030',
            fontSize: 16,
            colorBgContainerDisabled: 'rgb(210 199 176)',
            colorTextDisabled: '#ffffff'
          },
          Table: {
            headerBg: '#f7e6b3',
            headerColor: '#3a280f',
            headerSplitColor: 'transparent',
            colorBgContainer: '##fffae7',
            rowHoverBg: '##fffae7'
          },
          Pagination: {
            itemActiveBg: '#cda164',
            colorText: '#63615c'
          },
          Modal: {
            contentBg: '#fdf4d3'
          },
          Notification: {
            colorBgElevated: 'rgb(49, 48, 48)',
            colorText: '#8E7A6B',
            colorTextHeading: '#ffffff',
            colorError: '#ff4d4f',
            colorIcon: 'rgba(196, 163, 106)',
            colorIconHover: 'rgba(196, 163, 106)'
          }
        }
      }}
      {...props}
    >
      <StyleProvider layer>
        <App>{children}</App>
      </StyleProvider>
    </ConfigProvider>
  )
}
