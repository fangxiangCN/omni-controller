import './StatusBar.less'

export function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-section">
        <span className="status-indicator connected" />
        <span>Connected</span>
      </div>
      <div className="status-section">iPhone 15 Pro</div>
      <div className="status-section">393×852 @3x</div>
      <div className="status-section">Qwen-VL</div>
      <div className="status-section">3 tasks</div>
    </div>
  )
}
