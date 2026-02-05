import { Card, Tag } from 'antd'
import './InspectorPanel.less'

type InspectorPanelProps = {
  collapsed: boolean
  width: number
}

export function InspectorPanel({ collapsed }: InspectorPanelProps) {
  return (
    <aside className={collapsed ? 'inspector-panel collapsed' : 'inspector-panel'}>
      {!collapsed && (
        <div className="inspector-content">
          <Card title="Context" size="small" className="inspector-card">
            <div className="inspector-row">
              <span>Device</span>
              <Tag color="blue">iPhone 15 Pro</Tag>
            </div>
            <div className="inspector-row">
              <span>Model</span>
              <Tag>Qwen-VL</Tag>
            </div>
          </Card>
          <Card title="Task" size="small" className="inspector-card">
            <div className="inspector-row">
              <span>Status</span>
              <Tag color="green">Running</Tag>
            </div>
            <div className="inspector-row">
              <span>Latency</span>
              <span>1.2s avg</span>
            </div>
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
