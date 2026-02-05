import { Button } from 'antd'
import { CaretRightOutlined, PauseOutlined, StopOutlined } from '@ant-design/icons'
import './RecorderView.less'

export function RecorderView() {
  return (
    <div className="recorder-view">
      <div className="recorder-controls">
        <Button type="primary" icon={<CaretRightOutlined />}>
          Record
        </Button>
        <Button icon={<PauseOutlined />}>Pause</Button>
        <Button danger icon={<StopOutlined />}>
          Stop
        </Button>
      </div>
      <div className="recorder-list">
        <div className="session-item">
          <div className="session-title">Login Flow</div>
          <div className="session-meta">12 actions · 2:34</div>
        </div>
        <div className="session-item">
          <div className="session-title">Search Product</div>
          <div className="session-meta">8 actions · 1:45</div>
        </div>
      </div>
    </div>
  )
}
