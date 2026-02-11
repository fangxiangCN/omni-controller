import { Button, Input, Space } from 'antd'
import { useState } from 'react'
import { useAppStore } from '../store/app'
import './TaskComposer.less'

const { TextArea } = Input

export function TaskComposer() {
  const [instruction, setInstruction] = useState('')
  const startTask = useAppStore((state) => state.startTask)
  const stopTask = useAppStore((state) => state.stopTask)
  const taskState = useAppStore((state) => state.taskState)

  const onStart = () => {
    if (!instruction.trim()) return
    startTask(instruction)
  }

  return (
    <div className="task-composer">
      <TextArea
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        placeholder="输入任务指令..."
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
      <Space className="task-actions">
        <Button
          type="primary"
          onClick={onStart}
          disabled={taskState.status === 'running'}
        >
          Start
        </Button>
        <Button danger onClick={stopTask} disabled={taskState.status !== 'running'}>
          Stop
        </Button>
      </Space>
    </div>
  )
}
