import { Card, Empty, Typography, Tag, Button, Space } from 'antd'
import { 
  VideoCameraOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import './RecorderView.css'

const { Title, Text, Paragraph } = Typography

function RecorderView(): JSX.Element {
  return (
    <div className="recorder-view">
      <div className="recorder-header">
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          <VideoCameraOutlined style={{ marginRight: 8 }} />
          Session Recorder
        </Title>
        <Tag color="orange">Coming Soon</Tag>
      </div>

      <Card className="recorder-placeholder">
        <Empty
          image={<VideoCameraOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />}
          description={
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Title level={5} style={{ color: '#fff' }}>Recorder Feature</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 400, margin: '0 auto' }}>
                Record your device interactions and create automated test scripts.
                This feature will be available in the next release.
              </Paragraph>

              <Space direction="vertical" style={{ marginTop: 24, width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />}
                    size="large"
                    disabled
                  >
                    Start Recording
                  </Button>
                  
                  <Button 
                    icon={<PauseCircleOutlined />}
                    size="large"
                    disabled
                  >
                    Pause
                  </Button>
                  
                  <Button 
                    danger
                    icon={<StopOutlined />}
                    size="large"
                    disabled
                  >
                    Stop
                  </Button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="dashed"
                    icon={<SettingOutlined />}
                    disabled
                  >
                    Recorder Settings
                  </Button>
                </div>
              </Space>

              <div style={{ marginTop: 32, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <Text type="secondary">
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  Planned Features:
                </Text>
                <ul style={{ textAlign: 'left', marginTop: 8, color: 'rgba(255,255,255,0.6)' }}>
                  <li>Touch and gesture recording</li>
                  <li>Automated script generation</li>
                  <li>Export to multiple formats (JavaScript, Python)</li>
                  <li>Playback with configurable speed</li>
                  <li>Integration with CI/CD pipelines</li>
                </ul>
              </div>
            </div>
          }
        />
      </Card>
    </div>
  )
}

export default RecorderView
