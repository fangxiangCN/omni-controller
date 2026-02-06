import { Button, List, Popconfirm } from 'antd'
import { Player } from '@omni/visualizer'
import { useAppStore } from '../store/app'
import './ReportView.less'

export function ReportView() {
  const reportHtml = useAppStore((state) => state.reportHtml)
  const reportList = useAppStore((state) => state.reportList)
  const activeReportId = useAppStore((state) => state.activeReportId)
  const setActiveTaskId = useAppStore((state) => state.setActiveTaskId)
  const selectReport = useAppStore((state) => state.selectReport)
  const deleteReport = useAppStore((state) => state.deleteReport)

  return (
    <div className="report-view">
      <div className="report-panel">
        <Player
          className="report-player"
          reportFileContent={reportHtml}
          onTaskChange={(taskId) => setActiveTaskId(taskId || '')}
        />
      </div>
      <div className="report-detail">
        <div className="detail-card">
          <h3>Task Details</h3>
          <p>{reportHtml ? 'Report loaded.' : 'No report yet.'}</p>
        </div>
        <div className="detail-card">
          <h3>History</h3>
          <List
            size="small"
            dataSource={reportList}
            renderItem={(item) => (
              <List.Item
                className={item.id === activeReportId ? 'report-item active' : 'report-item'}
                onClick={() => selectReport(item.id)}
              >
                <div className="report-info">
                  <div className="report-title">{item.title}</div>
                  <div className="report-meta">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <Popconfirm
                  title="Delete this report?"
                  okText="Delete"
                  cancelText="Cancel"
                  onConfirm={(event) => {
                    event?.stopPropagation()
                    deleteReport(item.id)
                  }}
                >
                  <Button
                    size="small"
                    danger
                    onClick={(event) => event.stopPropagation()}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  )
}
