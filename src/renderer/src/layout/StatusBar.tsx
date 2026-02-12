import { Space, Badge, Typography } from 'antd'
import { 
  DesktopOutlined, 
  CheckCircleOutlined, 
  FileTextOutlined,
  ApiOutlined
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
  return (
    <div className="status-bar">
      <Space size="large">
        <Space>
          <DesktopOutlined />
          <Text>{deviceCount} devices</Text>
        </Space>

        {activeDevice && (
          <Space>
            <Badge 
              status={activeDevice.status === 'connected' ? 'success' : activeDevice.status === 'busy' ? 'processing' : 'error'} 
            />
            <Text>{activeDevice.name}</Text>
            <Text type="secondary">({activeDevice.status})</Text>
          </Space>
        )}

        <Space>
          <ApiOutlined />
          <Text>Mock API Mode</Text>
          <Badge status="warning" text="Disconnected" />
        </Space>

        <Space>
          <FileTextOutlined />
          <Text>View: {currentView}</Text>
        </Space>
      </Space>

      <Space>
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
        <Text>Ready</Text>
        <Text type="secondary">v1.0.0</Text>
      </Space>
    </div>
  )
}

export default StatusBar
