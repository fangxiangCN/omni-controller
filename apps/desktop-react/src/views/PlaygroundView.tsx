import { UniversalPlayground, PlaygroundResultView } from '@omni/visualizer'
import './PlaygroundView.less'

export function PlaygroundView() {
  return (
    <div className="playground-view">
      <div className="playground-pane">
        <div className="playground-placeholder">
          <UniversalPlayground
            playgroundId="desktop"
            className="playground-widget"
          />
        </div>
      </div>
      <div className="playground-result">
        <PlaygroundResultView
          result={{
            status: 'idle',
            prompt: 'Say hello',
            rawPrompt: 'Say hello',
            output: 'Ready.',
          }}
        />
      </div>
    </div>
  )
}
