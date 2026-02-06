import { Logo } from '@omni/visualizer'
import { Button, Switch } from 'antd'
import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useLayoutStore } from '../store/layout'
import {
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_MINIMIZE,
  IPC_WINDOW_TOGGLE_MAXIMIZE,
  IPC_WINDOW_STATE,
} from '@omni/shared'
import { ipcOn, ipcSend } from '../ipc'
import './TitleBar.less'

export function TitleBar() {
  const theme = useLayoutStore((state) => state.theme)
  const setTheme = useLayoutStore((state) => state.setTheme)
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const cleanup = ipcOn<{ maximized: boolean }>(IPC_WINDOW_STATE, (payload) => {
      if (!payload) return
      setMaximized(Boolean(payload.maximized))
    })
    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <div className="title-bar">
      <div
        className="title-left draggable"
        onDoubleClick={() => ipcSend(IPC_WINDOW_TOGGLE_MAXIMIZE, {})}
      >
        <Logo className="title-logo" />
        <span className="title-text">Omni Controller</span>
      </div>
      <div className="title-actions">
        <span className="title-hint">Midscene-aligned UI</span>
        <div className="title-theme">
          <span className="theme-label">Theme</span>
          <Switch
            size="small"
            checked={theme === 'light'}
            onChange={(checked) => setTheme(checked ? 'light' : 'dark')}
          />
        </div>
        <div className="window-controls">
          <Button
            size="small"
            type="text"
            icon={<MinusOutlined />}
            onClick={() => ipcSend(IPC_WINDOW_MINIMIZE, {})}
          />
          <Button
            size="small"
            type="text"
            icon={maximized ? <CompressOutlined /> : <ExpandOutlined />}
            onClick={() => ipcSend(IPC_WINDOW_TOGGLE_MAXIMIZE, {})}
          />
          <Button
            size="small"
            type="text"
            danger
            icon={<CloseOutlined />}
            onClick={() => ipcSend(IPC_WINDOW_CLOSE, {})}
          />
        </div>
      </div>
    </div>
  )
}
