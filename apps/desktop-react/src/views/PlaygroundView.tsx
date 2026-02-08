import { useMemo } from 'react'
// 使用 IPC wrapper 替代直接的 @omni/playground 导入
// 这样可以确保渲染进程不直接依赖可能包含 Node.js 代码的 @omni/playground 包
import { PlaygroundSDK } from '@omni/playground-client'
import { UniversalPlayground } from '@omni/visualizer'
import { PLAYGROUND_SERVER_PORT } from '@omni/shared-types/constants'
import { TaskComposer } from '../components/TaskComposer'
import { TaskTimeline } from '../components/TaskTimeline'
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
      <TaskComposer />
      <TaskTimeline />
    </div>
  )
}
