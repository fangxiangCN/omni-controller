import { Card, Tag, List } from 'antd'
import { useAppStore } from '../store/app'
import { ScreenCanvas } from '../components/ScreenCanvas'
import './InspectorPanel.less'

type InspectorPanelProps = {
  collapsed: boolean
  width: number
}

export function InspectorPanel({ collapsed }: InspectorPanelProps) {
  const activeDeviceId = useAppStore((state) => state.activeDeviceId)
  const logs = useAppStore((state) => state.logs)
  const taskState = useAppStore((state) => state.taskState)

  return (
    <aside className={collapsed ? 'inspector-panel collapsed' : 'inspector-panel'}>
      {!collapsed && (
        <div className="inspector-content">
          <Card title="Device Preview" size="small" className="inspector-card">
            <div className="inspector-preview">
              <ScreenCanvas deviceId={activeDeviceId} />
            </div>
          </Card>
          <Card title="Context" size="small" className="inspector-card">
            <div className="inspector-row">
              <span>Device</span>
              <Tag color="blue">{activeDeviceId || 'None'}</Tag>
            </div>
            <div className="inspector-row">
              <span>Model</span>
              <Tag>{process.env.MIDSCENE_MODEL_NAME || 'Unset'}</Tag>
            </div>
          </Card>
          <Card title="Task" size="small" className="inspector-card">
            <div className="inspector-row">
              <span>Status</span>
              <Tag color={taskState.status === 'running' ? 'green' : 'default'}>{taskState.status}</Tag>
            </div>
          </Card>
          <Card title="Logs" size="small" className="inspector-card">
            <List
              size="small"
              dataSource={logs.slice(-8)}
              renderItem={(item) => (
                <List.Item>
                  <span className={`log-tag log-${item.type}`}>{item.type}</span>
                  <span className="log-text">{item.content}</span>
                </List.Item>
              )}
            />
          </Card>
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
