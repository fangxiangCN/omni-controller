import { useMemo } from 'react'
import { PlaygroundSDK } from '@omni/playground'
import { UniversalPlayground } from '@omni/visualizer'
import { PLAYGROUND_SERVER_PORT } from '@omni/shared/constants'
import './PlaygroundView.less'

export function PlaygroundView() {
  const playgroundSDK = useMemo(
    () =>
      new PlaygroundSDK({
        type: 'remote-execution',
        serverUrl: `http://localhost:${PLAYGROUND_SERVER_PORT}`,
      }),
    [],
  )

  return (
    <div className="playground-view">
      <div className="playground-pane">
        <div className="playground-placeholder">
          <UniversalPlayground
            playgroundSDK={playgroundSDK}
            className="playground-widget"
            config={{ deviceType: 'android', serverMode: true }}
          />
        </div>
      </div>
    </div>
  )
}
