import { Card, Tag, Typography, Space, Alert, Descriptions, Divider } from 'antd'
import { 
  InfoCircleOutlined, 
  RobotOutlined,
  MobileOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import { Device } from '../types'
import './InspectorPanel.css'

const { Text, Title, Paragraph } = Typography

interface InspectorPanelProps {
  activeDevice: Device | undefined
  currentView: string
}

function InspectorPanel({ activeDevice, currentView }: InspectorPanelProps): JSX.Element {
  const isPlayground = currentView === 'playground'

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <Title level={5} style={{ margin: 0 }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Inspector
        </Title>
      </div>

      <div className="inspector-content">
        {/* Device Info */}
        {activeDevice ? (
          <Card
            title={
              <div className="inspector-card-header">
                <MobileOutlined className="inspector-card-icon" />
                <span>Device Information</span>
              </div>
            }
            size="small"
            className="inspector-card"
          >
            <Descriptions 
              column={1} 
              size="small"
              className="inspector-descriptions"
            >
              <Descriptions.Item label="Name">
                <Text strong>{activeDevice.name}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Type">
                <Tag 
                  color={activeDevice.type === 'android' ? 'success' : activeDevice.type === 'ios' ? 'processing' : 'warning'}
                  style={{ textTransform: 'uppercase' }}
                >
                  {activeDevice.type}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Status">
                <Tag 
                  color={activeDevice.status === 'connected' ? 'success' : activeDevice.status === 'busy' ? 'processing' : 'error'}
                >
                  {activeDevice.status}
                </Tag>
              </Descriptions.Item>
              
              {activeDevice.resolution && (
                <Descriptions.Item label="Resolution">
                  <Text className="font-mono">{activeDevice.resolution}</Text>
                </Descriptions.Item>
              )}
              
              {activeDevice.osVersion && (
                <Descriptions.Item label="OS Version">
                  <Text className="font-mono">{activeDevice.osVersion}</Text>
                </Descriptions.Item>
              )}
              
              {activeDevice.id && (
                <Descriptions.Item label="Device ID">
                  <Text type="secondary" className="font-mono" copyable>
                    {activeDevice.id}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        ) : (
          <Alert
            message="No Device Selected"
            description="Select a device from the left panel to view its details."
            type="info"
            showIcon
            className="inspector-alert"
          />
        )}

        <Divider className="inspector-divider" />

        {/* AI Agent Info */}
        {isPlayground && (
          <Card
            title={
              <div className="inspector-card-header">
                <RobotOutlined className="inspector-card-icon ai-icon" />
                <span>AI Agent</span>
              </div>
            }
            size="small"
            className="inspector-card"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Alert
                message="AI-Powered Automation"
                description="Send natural language instructions to control your device through AI."
                type="info"
                showIcon
                className="inspector-alert ai-alert"
              />
              
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                  Example Tasks:
                </Text>
                
                <ul className="example-tasks">
                  <li>
                    <CodeOutlined />
                    Open Chrome and navigate to Google
                  </li>
                  <li>
                    <CodeOutlined />
                    Search for "weather in New York"
                  </li>
                  <li>
                    <CodeOutlined />
                    Click the search button
                  </li>
                  <li>
                    <CodeOutlined />
                    Take a screenshot
                  </li>
                </ul>
              </div>
              
              <div className="ai-capabilities">
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                  Capabilities:
                </Text>
                
                <div className="capability-tags">
                  <Tag icon={<CheckCircleOutlined />} color="success">Tap</Tag>
                  <Tag icon={<CheckCircleOutlined />} color="success">Swipe</Tag>
                  <Tag icon={<CheckCircleOutlined />} color="success">Type</Tag>
                  <Tag icon={<CheckCircleOutlined />} color="success">Navigate</Tag>
                </div>
              </div>
            </Space>
          </Card>
        )}

        {/* View-specific info for other views */}
        {currentView === 'report' && (
          <Card
            title={
              <div className="inspector-card-header">
                <InfoCircleOutlined className="inspector-card-icon" />
                <span>Reports</span>
              </div>
            }
            size="small"
            className="inspector-card"
          >
            <Paragraph type="secondary" style={{ fontSize: 13 }}>
              View execution reports and task history. Click on any report to see detailed results.
            </Paragraph>
          </Card>
        )}

        {currentView === 'recorder' && (
          <Card
            title={
              <div className="inspector-card-header">
                <GlobalOutlined className="inspector-card-icon" />
                <span>Recorder</span>
              </div>
            }
            size="small"
            className="inspector-card"
          >
            <Paragraph type="secondary" style={{ fontSize: 13 }}>
              Record and replay user interactions. Create test scripts from manual actions.
            </Paragraph>
          </Card>
        )}
      </div>
    </div>
  )
}

export default InspectorPanel
