import { Card, Tag, Typography, Space, Alert } from 'antd'
import { 
  InfoCircleOutlined, 
  RobotOutlined
} from '@ant-design/icons'
import { Device } from '../types'
import './InspectorPanel.css'

const { Text, Title } = Typography

interface InspectorPanelProps {
  activeDevice: Device | undefined
  currentView: string
}

function InspectorPanel({ activeDevice, currentView }: InspectorPanelProps): JSX.Element {
  const isPlayground = currentView === 'playground'

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <Title level={5} style={{ color: '#fff', margin: 0 }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Inspector
        </Title>
      </div>

      {/* Device Info */}
      {activeDevice && (
        <Card 
          title="Device Info" 
          size="small"
          className="inspector-card"
          headStyle={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Name: </Text>
              <Text style={{ color: '#fff' }}>{activeDevice.name}</Text>
            </div>
            <div>
              <Text type="secondary">Type: </Text>
              <Tag color={activeDevice.type === 'android' ? 'green' : activeDevice.type === 'ios' ? 'blue' : 'orange'}>
                {activeDevice.type.toUpperCase()}
              </Tag>
            </div>
            <div>
              <Text type="secondary">Status: </Text>
              <Tag color={activeDevice.status === 'connected' ? 'success' : activeDevice.status === 'busy' ? 'processing' : 'error'}>
                {activeDevice.status}
              </Tag>
            </div>
            {activeDevice.resolution && (
              <div>
                <Text type="secondary">Resolution: </Text>
                <Text style={{ color: '#fff' }}>{activeDevice.resolution}</Text>
              </div>
            )}
            {activeDevice.osVersion && (
              <div>
                <Text type="secondary">OS: </Text>
                <Text style={{ color: '#fff' }}>{activeDevice.osVersion}</Text>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* AI Agent Info */}
      {isPlayground && (
        <Card
          title={
            <span>
              <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              AI Agent
            </span>
          }
          size="small"
          className="inspector-card"
          headStyle={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="AI-Powered Automation"
              description="Use the Playground to send natural language instructions to control your device."
              type="info"
              showIcon
              style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.3)' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Example tasks:
              </Text>
              <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, paddingLeft: 16, marginTop: 4 }}>
                <li>"Open Chrome"</li>
                <li>"Search for weather"</li>
                <li>"Click the search button"</li>
              </ul>
            </div>
          </Space>
        </Card>
      )}
    </div>
  )
}

export default InspectorPanel
