import { Player } from '@omni/visualizer'
import './ReportView.less'

export function ReportView() {
  return (
    <div className="report-view">
      <div className="report-panel">
        <Player className="report-player" />
      </div>
      <div className="report-detail">
        <div className="detail-card">
          <h3>Task Details</h3>
          <p>Action: Tap</p>
          <p>Target: Login Button</p>
          <p>Status: Completed</p>
        </div>
      </div>
    </div>
  )
}
