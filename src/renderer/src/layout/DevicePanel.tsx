import { List, Badge, Tag, Typography, Empty } from 'antd'
import { 
  MobileOutlined, 
  AppleOutlined,
  DesktopOutlined,
  WifiOutlined,
  DisconnectOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { Device } from '../types'
import './DevicePanel.css'

const { Text } = Typography

interface DevicePanelProps {
  devices: Device[]
  activeDeviceId: string | null
  onSelectDevice: (deviceId: string) => void
}

const getDeviceIcon = (type: Device['type']) => {
  switch (type) {
    case 'android':
      return <MobileOutlined style={{ color: '#52c41a' }} />
    case 'ios':
      return <AppleOutlined style={{ color: '#1890ff' }} />
    case 'web':
      return <DesktopOutlined style={{ color: '#faad14' }} />
    default:
      return <MobileOutlined />
  }
}

const getStatusIcon = (status: Device['status']) => {
  switch (status) {
    case 'connected':
      return <Badge status="success" />
    case 'busy':
      return <LoadingOutlined style={{ color: '#1890ff' }} spin />
    case 'disconnected':
      return <DisconnectOutlined style={{ color: '#ff4d4f' }} />
    default:
      return <Badge status="default" />
  }
}

const getStatusColor = (status: Device['status']) => {
  switch (status) {
    case 'connected':
      return 'success'
    case 'busy':
      return 'processing'
    case 'disconnected':
      return 'error'
    default:
      return 'default'
  }
}

function DevicePanel({ devices, activeDeviceId, onSelectDevice }: DevicePanelProps): JSX.Element {
  return (
    <div className="device-panel">
      <div className="device-panel-header">
        <Text strong style={{ color: '#fff' }}>
          Devices ({devices.length})
        </Text>
        <div style={{ marginTop: 8 }}>
          <WifiOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {devices.filter(d => d.status === 'connected').length} connected
          </Text>
        </div>
      </div>

      {devices.length === 0 ? (
        <Empty 
          description="No devices found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ color: '#fff', marginTop: 40 }}
        />
      ) : (
        <List
          className="device-list"
          dataSource={devices}
          renderItem={(device) => (
            <List.Item
              className={`device-item ${activeDeviceId === device.id ? 'active' : ''}`}
              onClick={() => onSelectDevice(device.id)}
            >
              <List.Item.Meta
                avatar={<div className="device-icon">{getDeviceIcon(device.type)}</div>}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: '#fff' }}>{device.name}</Text>
                    {getStatusIcon(device.status)}
                  </div>
                }
                description={
                  <div>
                    <Tag color={getStatusColor(device.status)} >
                      {device.status}
                    </Tag>
                    {device.resolution && (
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                        {device.resolution}
                      </Text>
                    )}
                    {device.osVersion && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {device.osVersion}
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

export default DevicePanel
