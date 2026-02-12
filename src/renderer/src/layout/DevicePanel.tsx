import { List, Badge, Tag, Typography, Empty, Button, Tooltip } from 'antd'
import { 
  MobileOutlined, 
  AppleOutlined,
  DesktopOutlined,
  WifiOutlined,
  DisconnectOutlined,
  LoadingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Device } from '../types'
import './DevicePanel.css'

const { Text } = Typography

interface DevicePanelProps {
  devices: Device[]
  activeDeviceId: string | null
  onSelectDevice: (deviceId: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const getDeviceIcon = (type: Device['type']) => {
  const iconStyle = { fontSize: 20 }
  switch (type) {
    case 'android':
      return <MobileOutlined style={{ ...iconStyle, color: 'var(--color-success)' }} />
    case 'ios':
      return <AppleOutlined style={{ ...iconStyle, color: 'var(--color-primary)' }} />
    case 'web':
      return <DesktopOutlined style={{ ...iconStyle, color: 'var(--color-warning)' }} />
    default:
      return <MobileOutlined style={iconStyle} />
  }
}

const getStatusIcon = (status: Device['status']) => {
  switch (status) {
    case 'connected':
      return <Badge status="success" />
    case 'busy':
      return <LoadingOutlined style={{ color: 'var(--color-primary)' }} spin />
    case 'disconnected':
      return <DisconnectOutlined style={{ color: 'var(--color-error)' }} />
    default:
      return <Badge status="default" />
  }
}

const getStatusColor = (status: Device['status']): string => {
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

function DevicePanel({ 
  devices, 
  activeDeviceId, 
  onSelectDevice,
  collapsed = false,
  onToggleCollapse,
}: DevicePanelProps): JSX.Element {
  const connectedCount = devices.filter(d => d.status === 'connected').length

  if (collapsed) {
    return (
      <div className="device-panel device-panel--collapsed">
        <div className="device-panel-header device-panel-header--collapsed">
          <Tooltip title="Expand" placement="right">
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={onToggleCollapse}
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </Tooltip>
        </div>
        
        <div className="device-list-collapsed">
          {devices.map(device => (
            <Tooltip key={device.id} title={device.name} placement="right">
              <div
                className={`device-item-collapsed ${activeDeviceId === device.id ? 'active' : ''}`}
                onClick={() => onSelectDevice(device.id)}
              >
                <div className="device-icon-collapsed">
                  {getDeviceIcon(device.type)}
                </div>
                {device.status === 'connected' && (
                  <div className="device-status-indicator" />
                )}
              </div>
            </Tooltip>
          ))}
          
          <Tooltip title="Refresh devices" placement="right">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              style={{ 
                width: 48, 
                height: 48, 
                marginTop: 8,
                color: 'var(--color-text-secondary)',
              }}
              onClick={() => window.location.reload()}
            />
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <div className="device-panel">
      <div className="device-panel-header">
        <div className="device-panel-header-top">
          <div className="device-panel-title">
            <Text strong style={{ color: 'var(--color-text-primary)', fontSize: 16 }}>
              Devices
            </Text>
            <Tag color="default" style={{ marginLeft: 8, fontSize: 12 }}>
              {devices.length}
            </Tag>
          </div>
          
          <div className="device-panel-actions">
            <Tooltip title="Refresh">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                style={{ color: 'var(--color-text-secondary)' }}
              />
            </Tooltip>
            
            <Tooltip title="Collapse">
              <Button
                type="text"
                size="small"
                icon={<MenuFoldOutlined />}
                onClick={onToggleCollapse}
                style={{ color: 'var(--color-text-secondary)' }}
              />
            </Tooltip>
          </div>
        </div>
        
        <div className="device-panel-subtitle">
          <WifiOutlined style={{ marginRight: 6, color: 'var(--color-success)' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {connectedCount} connected
          </Text>
        </div>
      </div>

      <div className="device-list-container">
        {devices.length === 0 ? (
          <Empty
            description={
              <Text type="secondary">No devices found</Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 40, opacity: 0.7 }}
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
                  avatar={
                    <div className="device-icon">
                      {getDeviceIcon(device.type)}
                    </div>
                  }
                  title={
                    <div className="device-item-title">
                      <Text style={{ color: 'var(--color-text-primary)' }} ellipsis>
                        {device.name}
                      </Text>
                      {getStatusIcon(device.status)}
                    </div>
                  }
                  description={
                    <div className="device-item-description">
                      <div className="device-item-tags">
                        <Tag 
                          color={getStatusColor(device.status)}
                          style={{ fontSize: 11 }}
                        >
                          {device.status}
                        </Tag>
                        
                        {device.resolution && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {device.resolution}
                          </Text>
                        )}
                      </div>
                      
                      {device.osVersion && (
                        <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                          {device.osVersion}
                        </Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  )
}

export default DevicePanel
