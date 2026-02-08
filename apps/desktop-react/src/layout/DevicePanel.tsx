import { Button, Divider, Tag } from 'antd'
import {
  AndroidOutlined,
  DisconnectOutlined,
  GlobalOutlined,
  LaptopOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useMemo } from 'react'
import { useAppStore } from '../store/app'
import type { DeviceInfo } from '@omni/shared-types'
import './DevicePanel.less'

type DevicePanelProps = {
  collapsed: boolean
  width: number
}

export function DevicePanel({ collapsed }: DevicePanelProps) {
  const devices = useAppStore((state) => state.devices)
  const activeDeviceId = useAppStore((state) => state.activeDeviceId)
  const connectingDeviceId = useAppStore((state) => state.connectingDeviceId)
  const deviceThumbnails = useAppStore((state) => state.deviceThumbnails)
  const setActiveDevice = useAppStore((state) => state.setActiveDevice)
  const refreshDevices = useAppStore((state) => state.refreshDevices)
  const disconnectDevice = useAppStore((state) => state.disconnectDevice)

  const { connected, disconnected } = useMemo(() => {
    const connected: DeviceInfo[] = []
    const disconnected: DeviceInfo[] = []
    devices.forEach((device) => {
      if (device.type === 'android') connected.push(device)
      else disconnected.push(device)
    })
    return { connected, disconnected }
  }, [devices])

  const collapsedStats = useMemo(() => {
    const stats = { android: 0, ohos: 0, web: 0 }
    devices.forEach((device) => {
      if (device.type === 'android') stats.android += 1
      if (device.type === 'ohos') stats.ohos += 1
      if (device.type === 'web') stats.web += 1
    })
    return stats
  }, [devices])

  return (
    <aside className={collapsed ? 'device-panel collapsed' : 'device-panel'}>
      <div className="panel-header">
        <span className="panel-title">Devices</span>
        {!collapsed && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={refreshDevices}
          >
            Connect
          </Button>
        )}
      </div>
      <Divider className="panel-divider" />
      {!collapsed && (
        <div className="device-groups">
          <div className="group-title">CONNECTED</div>
          {connected.map((device) => (
            <div
              key={device.id}
              className={`device-item connected ${device.id === activeDeviceId ? 'active' : ''}`}
              onClick={() => setActiveDevice(device.id)}
            >
              <div className="device-thumb">
                {deviceThumbnails[device.id] ? (
                  <img src={deviceThumbnails[device.id]} alt={device.name} />
                ) : (
                  <div className="thumb-placeholder">{device.name.slice(0, 1)}</div>
                )}
              </div>
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-sub">{device.id}</div>
              </div>
              {device.id === connectingDeviceId ? (
                <Tag color="gold">connecting</Tag>
              ) : (
                <Tag color="green">online</Tag>
              )}
              <div className="device-actions">
                <Tooltip title="Refresh devices">
                  <button
                    type="button"
                    className="action-btn"
                    onClick={(event) => {
                      event.stopPropagation()
                      refreshDevices()
                    }}
                  >
                    <ReloadOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Disconnect">
                  <button
                    type="button"
                    className="action-btn"
                    onClick={(event) => {
                      event.stopPropagation()
                      disconnectDevice()
                    }}
                  >
                    <DisconnectOutlined />
                  </button>
                </Tooltip>
              </div>
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
          {activeDeviceId && (
            <Button size="small" danger className="disconnect-button" onClick={disconnectDevice}>
              Disconnect
            </Button>
          )}
        </div>
      )}
      {collapsed && (
        <div className="collapsed-icons">
          <div className="collapsed-item">
            <AndroidOutlined />
            <span>{collapsedStats.android}</span>
          </div>
          <div className="collapsed-item">
            <LaptopOutlined />
            <span>{collapsedStats.ohos}</span>
          </div>
          <div className="collapsed-item">
            <GlobalOutlined />
            <span>{collapsedStats.web}</span>
          </div>
        </div>
      )}
    </aside>
  )
}
