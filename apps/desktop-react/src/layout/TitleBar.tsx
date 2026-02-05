import { Logo } from '@omni/visualizer'
import './TitleBar.less'

export function TitleBar() {
  return (
    <div className="title-bar">
      <div className="title-left">
        <Logo className="title-logo" />
        <span className="title-text">Omni Controller</span>
      </div>
      <div className="title-actions">
        <span className="title-hint">Midscene-aligned UI</span>
      </div>
    </div>
  )
}
