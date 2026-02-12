import React, { useState, useEffect } from 'react'
import { Layout, Button, Space, Tooltip } from 'antd'
import { 
  MinusOutlined, 
  BorderOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import './TitleBar.css'

const { Header } = Layout

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
    <Header className="title-bar" style={{ 
      height: 40, 
      padding: '0 16px',
      background: '#1a1a2e',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      // @ts-ignore
      WebkitAppRegion: "drag"
    } as unknown as React.CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AppstoreOutlined style={{ fontSize: 20, color: '#1890ff' }} />
        <span style={{ 
          color: '#fff', 
          fontSize: 14, 
          fontWeight: 600,
          marginLeft: 8 
        }}>
          Omni Controller
        </span>
      </div>

      <Space style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <Tooltip title="Minimize">
          <Button
            type="text"
            icon={<MinusOutlined />}
            onClick={handleMinimize}
            style={{ color: '#fff' }}
          />
        </Tooltip>
        <Tooltip title={isMaximized ? 'Restore' : 'Maximize'}>
          <Button
            type="text"
            icon={isMaximized ? <FullscreenExitOutlined /> : <BorderOutlined />}
            onClick={handleMaximize}
            style={{ color: '#fff' }}
          />
        </Tooltip>
        <Tooltip title="Close">
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleClose}
            style={{ color: '#fff' }}
            danger
          />
        </Tooltip>
      </Space>
    </Header>
  )
}

export default TitleBar
