import { useState, useEffect } from 'react'
import { 
  SendOutlined, 
  StopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  PictureOutlined,
  RobotOutlined,
  SettingOutlined,
  LoadingOutlined,
  RobotFilled
} from '@ant-design/icons'
import { Input, Typography, Space, Tag, Empty, Timeline, Button, Card, Alert, Modal, Form, Select, Divider } from 'antd'
import { Device } from '../types'
import { useAgent } from '../hooks/useAgent'
import type { AgentLogPayload, ModelConfigPayload, ModelType } from '../types/ipc'
import './PlaygroundView.css'

const { TextArea } = Input
const { Text, Title, Paragraph } = Typography

interface PlaygroundViewProps {
  activeDevice: Device | undefined
}

const getLogIcon = (type: AgentLogPayload['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14' }} />
    default:
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />
  }
}

function PlaygroundView({ activeDevice }: PlaygroundViewProps): JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelType>('autoglm-phone')
  const [adbPath, setAdbPath] = useState('')
  
  const {
    isReady,
    isRunning,
    logs,
    currentThought,
    currentActions,
    lastResult,
    error,
    models,
    initializeWithModel,
    startTask,
    stopTask,
    logsEndRef,
  } = useAgent()

  // Load saved ADB path on mount
  useEffect(() => {
    const loadAdbPath = async () => {
      try {
        const { ipcClient } = await import('../ipc/client')
        const savedPath = await ipcClient.device.getAdbPath()
        if (savedPath) {
          setAdbPath(savedPath)
        }
      } catch (err) {
        console.error('Failed to load ADB path:', err)
      }
    }
    loadAdbPath()
  }, [])

  const handleSetAdbPath = async () => {
    if (adbPath) {
      try {
        const { ipcClient } = await import('../ipc/client')
        const result = await ipcClient.device.setAdbPath(adbPath)
        if (!result.success) {
          console.error('Failed to set ADB path:', result.error)
        }
      } catch (err) {
        console.error('Failed to set ADB path:', err)
      }
    }
  }

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].type)
    }
  }, [models, selectedModel])

  const handleInitialize = async () => {
    if (!apiKey || !selectedModel) {
      setApiKeyModalVisible(true)
      return
    }
    await initializeWithModel(selectedModel, apiKey)
  }

  const handleSubmitApiKey = async () => {
    if (apiKey && selectedModel) {
      await initializeWithModel(selectedModel, apiKey)
      setApiKeyModalVisible(false)
    }
  }

  const handleSend = () => {
    if (!prompt.trim()) return
    
    if (!isReady) {
      handleInitialize()
      return
    }
    
    startTask(prompt)
    setPrompt('')
  }

  const handleStop = () => {
    stopTask(`task-${Date.now()}`)
  }

  return (
    <div className="playground-view">
      {/* Screen Display Area */}
      <div className="screen-area">
        {activeDevice ? (
          <div className="screen-placeholder">
            <PictureOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Title level={4} style={{ color: '#fff' }}>{activeDevice.name}</Title>
              <Space direction="vertical" style={{ marginTop: 8 }}>
                <Text type="secondary">Resolution: {activeDevice.resolution || 'Unknown'}</Text>
                <Text type="secondary">OS: {activeDevice.osVersion || 'Unknown'}</Text>
                <Tag color={activeDevice.status === 'connected' ? 'success' : 'warning'}>
                  {activeDevice.status}
                </Tag>
              </Space>
            </div>
            <div className="screen-overlay">
              <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
                Screen capture not available in demo mode
              </Text>
            </div>
          </div>
        ) : (
          <Empty
            description="Select a device to start"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ color: '#fff' }}
          />
        )}
      </div>

      {/* AI Status Card */}
      {isReady && (
        <Card 
          size="small" 
          style={{ 
            marginBottom: 16, 
            background: 'rgba(24, 144, 255, 0.1)',
            borderColor: 'rgba(24, 144, 255, 0.3)'
          }}
        >
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <Text style={{ color: '#fff' }}>AI Agent Ready</Text>
            {isRunning && <LoadingOutlined style={{ color: '#1890ff' }} spin />}
          </Space>
          
          {currentThought && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Thinking: {currentThought}</Text>
            </div>
          )}
          
          {currentActions.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Actions: {currentActions.join(', ')}
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Task Input Area */}
      <div className="task-input-area">
        <div style={{ flex: 1 }}>
          <TextArea
            placeholder={activeDevice 
              ? isReady 
                ? "Enter your instruction (e.g., 'Open Chrome and search for weather')" 
                : 'Click the settings button to configure AI API Key'
              : 'Please select a device first'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!activeDevice || isRunning}
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          />
        </div>
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setApiKeyModalVisible(true)}
            disabled={!activeDevice}
          >
            {isReady ? 'Settings' : 'Setup'}
          </Button>
          
          {isRunning ? (
            <Button
              type="primary"
              danger
              icon={<StopOutlined />}
              onClick={handleStop}
              size="large"
            >
              Stop
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!activeDevice || !prompt.trim()}
              size="large"
            >
              {isReady ? 'Send' : 'Setup & Send'}
            </Button>
          )}
        </Space>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Agent Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      {/* Task Complete Result */}
      {lastResult && !isRunning && (
        <Alert
          message={lastResult.success ? 'Task Completed' : 'Task Failed'}
          description={lastResult.message}
          type={lastResult.success ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      {/* Task Timeline */}
      <div className="task-timeline">
        <div className="timeline-header">
          <Text strong style={{ color: '#fff' }}>AI Execution Log</Text>
          <Text type="secondary">{logs.length} logs</Text>
        </div>

        {logs.length === 0 ? (
          <Empty
            description="No AI execution logs yet. Send a task to see the AI in action."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ color: '#fff', marginTop: 20 }}
          />
        ) : (
          <Timeline
            mode="left"
            items={logs.map((log, index) => ({
              key: index,
              dot: getLogIcon(log.type),
              label: <Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </Text>,
              children: (
                <Text style={{ color: '#fff' }}>{log.content}</Text>
              )
            }))}
          />
        )}
        <div ref={logsEndRef} />
      </div>

      {/* API Key Modal */}
      <Modal
        title="Configure AI Model & ADB"
        open={apiKeyModalVisible}
        onOk={handleSubmitApiKey}
        onCancel={() => setApiKeyModalVisible(false)}
        okText="Initialize"
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="ADB Path (optional)">
            <Input
              placeholder="C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe"
              value={adbPath}
              onChange={(e) => setAdbPath(e.target.value)}
              onBlur={handleSetAdbPath}
            />
            <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
              Leave empty to use system PATH. If ADB is not found, specify the full path to adb.exe
            </Paragraph>
          </Form.Item>

          <Divider />

          <Form.Item label="AI Model" required>
            <Select
              value={selectedModel}
              onChange={(value) => setSelectedModel(value)}
              style={{ width: '100%' }}
              placeholder="Select an AI model"
            >
              {models.map((model) => (
                <Select.Option key={model.type} value={model.type}>
                  <Space>
                    <RobotFilled />
                    <span>{model.name}</span>
                    {model.description && (
                      <span style={{ color: '#999', fontSize: 12 }}>
                        - {model.description}
                      </span>
                    )}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {selectedModel && (
            <Form.Item>
              <Alert
                message={models.find(m => m.type === selectedModel)?.description || ''}
                type="info"
                showIcon
                style={{ marginBottom: 0 }}
              />
            </Form.Item>
          )}
          
          <Form.Item label="API Key" required>
            <Input.Password
              placeholder={`Enter your ${selectedModel === 'autoglm-phone' ? 'Zhipu AI' : selectedModel?.includes('claude') ? 'Anthropic' : 'OpenAI'} API Key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </Form.Item>
          
          <Paragraph type="secondary">
            {selectedModel === 'autoglm-phone' ? (
              <>
                Get your API key from{' '}
                <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer">
                  Zhipu AI Open Platform
                </a>
              </>
            ) : selectedModel?.includes('claude') ? (
              <>
                Get your API key from{' '}
                <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                  Anthropic Console
                </a>
              </>
            ) : (
              <>
                Get your API key from{' '}
                <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer">
                  OpenAI Platform
                </a>
              </>
            )}
          </Paragraph>
        </Form>
      </Modal>
    </div>
  )
}

export default PlaygroundView
