import { Dropdown } from 'antd'
import './index.scss'
import { Icon } from '@/components'
import { type Asset } from '@/entities/swap'

interface AssetSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  list: Asset[]
  onChange?: (assetCode: string) => void
  label: string
}

export const AssetSelect: React.FC<AssetSelectProps> = ({
  label,
  className,
  value,
  list,
  onChange
}) => {
  const [open, setOpen] = useState(false)
  const asset = useMemo(() => list.find(item => item.assetCode === value), [value, list])

  const onClickItem = (item: Asset) => {
    onChange?.(item.assetCode)
    setOpen(false)
  }

  return (
    <div className={`oooo-select ${className}`}>
      <img className='oooo-select__image' src={asset?.icon} />
      <div>
        <p className='oooo-select__label'>{label}</p>
        <Dropdown
          dropdownRender={() => (
            <div className='oooo-select-popover'>
              {list.map(item => (
                <div className='oooo-select-item' key={item.assetCode} onClick={() => { onClickItem(item) }}>
                  <img className="oooo-select-item__image" src={item.icon} />
                  <p className='oooo-select-item__label'>{item.assetCode}</p>
                </div>
              ))}
            </div>
          )}
          arrow={false}
          trigger={['click']}
          placement='bottom'
          open={open}
          onOpenChange={setOpen}
        >
          <div className='oooo-select__token'>
            {value}
            <Icon className="oooo-select__icon" name='dropdaown' />
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
