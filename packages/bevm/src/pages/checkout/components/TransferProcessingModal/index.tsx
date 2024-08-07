import { Modal, type ModalProps } from 'antd'
import './index.scss'
import classNames from 'classnames'

export interface TransferProcessingModalProps extends ModalProps {
}

export const TransferProcessingModal: React.FC<TransferProcessingModalProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Modal
      className={classNames(
        'oooo-tranfer-processing-modal',
        className
      )}
      footer={null}
      maskClosable={false}
      {...props}
    >
      <div className='oooo-tranfer-processing-modal__header'>
        Transfer Processing
      </div>
      <div className='oooo-tranfer-processing-modal__content'>
        {children}
      </div>
    </Modal>
  )
}
