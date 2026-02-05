import { Button, Divider, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import './DevicePanel.less'

type DevicePanelProps = {
  collapsed: boolean
  width: number
}

const mockDevices = [
  {
    id: 'ios-1',
    name: 'iPhone 15 Pro',
    info: 'iOS 17.1',
    status: 'connected',
  },
  {
    id: 'web-1',
    name: 'Chrome - Web',
    info: 'localhost:3000',
    status: 'connected',
  },
  {
    id: 'android-1',
    name: 'Pixel 7',
    info: 'Android 14',
    status: 'disconnected',
  },
]

export function DevicePanel({ collapsed }: DevicePanelProps) {
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
          {mockDevices.slice(0, 2).map((device) => (
            <div key={device.id} className="device-item connected">
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-sub">{device.info}</div>
              </div>
              <Tag color="green">online</Tag>
            </div>
          ))}
          <div className="group-title">DISCONNECTED</div>
          {mockDevices.slice(2).map((device) => (
            <div key={device.id} className="device-item disconnected">
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-sub">{device.info}</div>
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
