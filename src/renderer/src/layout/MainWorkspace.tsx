import { Tabs } from 'antd'
import { 
  PlayCircleOutlined, 
  FileTextOutlined, 
  VideoCameraOutlined 
} from '@ant-design/icons'
import { Device, Report } from '../types'
import PlaygroundView from '../views/PlaygroundView'
import ReportView from '../views/ReportView'
import RecorderView from '../views/RecorderView'
import './MainWorkspace.css'

interface MainWorkspaceProps {
  currentView: 'playground' | 'report' | 'recorder'
  onChangeView: (view: 'playground' | 'report' | 'recorder') => void
  activeDevice: Device | undefined
  reports: Report[]
}

function MainWorkspace({ 
  currentView, 
  onChangeView, 
  activeDevice,
  reports 
}: MainWorkspaceProps): JSX.Element {
  const items = [
    {
      key: 'playground',
      label: (
        <span>
          <PlayCircleOutlined />
          Playground
        </span>
      ),
      children: <PlaygroundView activeDevice={activeDevice} />
    },
    {
      key: 'report',
      label: (
        <span>
          <FileTextOutlined />
          Reports ({reports.length})
        </span>
      ),
      children: <ReportView reports={reports} />
    },
    {
      key: 'recorder',
      label: (
        <span>
          <VideoCameraOutlined />
          Recorder
        </span>
      ),
      children: <RecorderView />
    }
  ]

  return (
    <div className="main-workspace">
      <Tabs
        activeKey={currentView}
        onChange={(key) => onChangeView(key as 'playground' | 'report' | 'recorder')}
        items={items}
        type="card"
        className="workspace-tabs"
      />
    </div>
  )
}

export default MainWorkspace
