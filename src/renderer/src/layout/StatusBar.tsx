import { Space, Badge, Typography } from 'antd'
import { 
  DesktopOutlined, 
  CheckCircleOutlined, 
  ApiOutlined,
  MobileOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import { Device } from '../types'
import './StatusBar.css'

const { Text } = Typography

interface StatusBarProps {
  deviceCount: number
  activeDevice: Device | undefined
  currentView: 'playground' | 'report' | 'recorder'
}

function StatusBar({ deviceCount, activeDevice, currentView }: StatusBarProps): JSX.Element {
  const getStatusConfig = () => {
    if (!activeDevice) return { icon: <WifiOutlined />, text: 'No device', color: 'default' }
    
    switch (activeDevice.status) {
      case 'connected':
        return { 
          icon: <CheckCircleOutlined />, 
          text: activeDevice.name,
          color: 'success'
        }
      case 'busy':
        return { 
          icon: <DesktopOutlined />, 
          text: activeDevice.name,
          color: 'processing'
        }
      default:
        return { 
          icon: <MobileOutlined />, 
          text: activeDevice.name,
          color: 'error'
        }
    }
  }

  const status = getStatusConfig()

  return (
    <div className="status-bar">
      <Space size="large" className="status-bar-left">
        <Space size="small">
          <DesktopOutlined className="status-icon" />
          <Text className="status-text">
            {deviceCount} device{deviceCount !== 1 ? 's' : ''}
          </Text>
        </Space>

        {activeDevice && (
          <Space size="small" className="status-device"
          >
            <Badge 
              status={status.color as any}
              className="status-badge"
            />
            <Text className="status-text">{status.text}</Text>
            <Text className="status-subtext">({activeDevice.status})</Text>
          </Space>
        )}

        <Space size="small">
          <ApiOutlined className="status-icon" />
          <Text className="status-text">{currentView}</Text>
        </Space>
      </Space>

      <Space size="small" className="status-bar-right">
        <Text className="status-version">v1.0.0</Text>
      </Space>
    </div>
  )
}

export default StatusBar
