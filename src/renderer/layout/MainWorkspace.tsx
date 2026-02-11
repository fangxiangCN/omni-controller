import { Segmented } from 'antd'
import { useLayoutStore } from '../store/layout'
import { PlaygroundView } from '../views/PlaygroundView'
import { ReportView } from '../views/ReportView'
import { RecorderView } from '../views/RecorderView'
import './MainWorkspace.less'

export function MainWorkspace() {
  const { mode, setMode } = useLayoutStore()

  return (
    <section className="main-workspace">
      <div className="workspace-toolbar">
        <Segmented
          value={mode}
          onChange={(value) => setMode(value as typeof mode)}
          options={[
            { label: 'Playground', value: 'playground' },
            { label: 'Report', value: 'report' },
            { label: 'Recorder', value: 'recorder' },
          ]}
        />
      </div>
      <div className="workspace-body">
        {mode === 'playground' && <PlaygroundView />}
        {mode === 'report' && <ReportView />}
        {mode === 'recorder' && <RecorderView />}
      </div>
    </section>
  )
}
