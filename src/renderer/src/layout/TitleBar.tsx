import { useState, useEffect } from 'react'
import { Layout, Button, Space, Tooltip, Typography } from 'antd'
import { 
  MinusOutlined, 
  BorderOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  ControlOutlined
} from '@ant-design/icons'
import './TitleBar.css'

const { Header } = Layout
const { Text } = Typography

// Extend window interface
declare global {
  interface Window {
    api?: {
      minimizeWindow: () => void
      toggleMaximizeWindow: () => void
      closeWindow: () => void
      onWindowStateChange: (callback: (state: { maximized: boolean }) => void) => void
    }
  }
}

function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Listen for window state changes
    window.api?.onWindowStateChange((state) => {
      setIsMaximized(state.maximized)
    })
  }, [])

  const handleMinimize = () => {
    window.api?.minimizeWindow()
  }

  const handleMaximize = () => {
    window.api?.toggleMaximizeWindow()
  }

  const handleClose = () => {
    window.api?.closeWindow()
  }

  return (
    <Header className="title-bar">
      <div className="title-bar-left">
        <div className="title-bar-icon">
          <ControlOutlined />
        </div>
        <Text className="title-bar-text">
          Omni Controller
        </Text>
      </div>

      <Space className="title-bar-controls">
        <Tooltip title="Minimize" mouseEnterDelay={0.5}>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={handleMinimize}
            className="title-bar-btn"
          />
        </Tooltip>
        
        <Tooltip title={isMaximized ? 'Restore' : 'Maximize'} mouseEnterDelay={0.5}>
          <Button
            type="text"
            size="small"
            icon={isMaximized ? <FullscreenExitOutlined /> : <BorderOutlined />}
            onClick={handleMaximize}
            className="title-bar-btn"
          />
        </Tooltip>
        
        <Tooltip title="Close" mouseEnterDelay={0.5}>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleClose}
            className="title-bar-btn title-bar-btn-close"
            danger
          />
        </Tooltip>
      </Space>
    </Header>
  )
}

export default TitleBar
