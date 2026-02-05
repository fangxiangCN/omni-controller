import { Button, Divider, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { useAppStore } from '../store/app'
import type { DeviceInfo } from '@omni/shared'
import './DevicePanel.less'

type DevicePanelProps = {
  collapsed: boolean
  width: number
}

export function DevicePanel({ collapsed }: DevicePanelProps) {
  const devices = useAppStore((state) => state.devices)
  const activeDeviceId = useAppStore((state) => state.activeDeviceId)
  const setActiveDevice = useAppStore((state) => state.setActiveDevice)

  const { connected, disconnected } = useMemo(() => {
    const connected: DeviceInfo[] = []
    const disconnected: DeviceInfo[] = []
    devices.forEach((device) => {
      if (device.type === 'android') connected.push(device)
      else disconnected.push(device)
    })
    return { connected, disconnected }
  }, [devices])

  return (
    <aside className={collapsed ? 'device-panel collapsed' : 'device-panel'}>
      <div className="panel-header">
        <span className="panel-title">Devices</span>
        {!collapsed && (
          <Button type="primary" size="small" icon={<PlusOutlined />}>
            Connect
          </Button>
        )}
      </div>
      <Divider className="panel-divider" />
      {!collapsed && (
        <div className="device-groups">
          <div className="group-title">CONNECTED</div>
          {connected.map((device) => (
            <div key={device.id} className={`device-item connected ${device.id === activeDeviceId ? 'active' : ''}`} onClick={() => setActiveDevice(device.id)}>
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-sub">{device.id}</div>
              </div>
              <Tag color="green">online</Tag>
            </div>
          ))}
          <div className="group-title">DISCONNECTED</div>
          {disconnected.map((device) => (
            <div key={device.id} className="device-item disconnected">
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-sub">{device.id}</div>
              </div>
              <Tag>offline</Tag>
            </div>
          ))}
        </div>
      )}
      {collapsed && (
        <div className="collapsed-icons">
          <span className="collapsed-dot" />
          <span className="collapsed-dot" />
          <span className="collapsed-dot" />
        </div>
      )}
    </aside>
  )
}
