import { Input, List, Tag, Select } from 'antd'
import { useMemo, useState } from 'react'
import { useAppStore } from '../store/app'
import './TaskTimeline.less'

export function TaskTimeline() {
  const logs = useAppStore((state) => state.logs)
  const taskState = useAppStore((state) => state.taskState)
  const activeTaskId = useAppStore((state) => state.activeTaskId)
  const setActiveTaskId = useAppStore((state) => state.setActiveTaskId)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [taskFilter, setTaskFilter] = useState<string>('all')
  const [query, setQuery] = useState<string>('')

  const taskOptions = useMemo(() => {
    const ids = new Set<string>()
    logs.forEach((item) => {
      if (item.taskId) ids.add(item.taskId)
    })
    return Array.from(ids).map((id) => ({ label: id, value: id }))
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      const effectiveTask =
        taskFilter !== 'all' ? taskFilter : activeTaskId || 'all'
      if (effectiveTask !== 'all' && item.taskId !== effectiveTask) return false
      if (query && !item.content.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
      return true
    })
  }, [logs, typeFilter, taskFilter, query, activeTaskId])

  const activeLog = useMemo(() => {
    if (!activeTaskId) return null
    return [...logs].reverse().find((item) => item.taskId === activeTaskId) || null
  }, [logs, activeTaskId])

  return (
    <div className="task-timeline">
      <div className="timeline-header">
        <span className="timeline-title">Timeline</span>
        <Tag color={taskState.status === 'running' ? 'green' : 'default'}>
          {taskState.status}
        </Tag>
      </div>
      <div className="timeline-filters">
        <Input
          size="small"
          placeholder="Search logs..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          size="small"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Info', value: 'info' },
            { label: 'Plan', value: 'plan' },
            { label: 'Thought', value: 'thought' },
            { label: 'Action', value: 'action' },
            { label: 'Error', value: 'error' },
          ]}
        />
        <Select
          size="small"
          value={taskFilter}
          onChange={(value) => {
            setTaskFilter(value)
            if (value !== 'all') setActiveTaskId(value)
          }}
          options={[{ label: 'All tasks', value: 'all' }, ...taskOptions]}
        />
      </div>
      <List
        size="small"
        dataSource={filteredLogs.slice(-50)}
        renderItem={(item) => (
          <List.Item
            className={
              item.taskId && item.taskId === activeTaskId ? 'timeline-item active' : 'timeline-item'
            }
            onClick={() => item.taskId && setActiveTaskId(item.taskId)}
          >
            <span className={`log-tag log-${item.type}`}>{item.type}</span>
            <span className="log-text">{item.content}</span>
            {item.taskId && <span className="log-taskid">{item.taskId}</span>}
          </List.Item>
        )}
      />
      {activeLog && (
        <div className="timeline-detail">
          <div className="detail-title">Selected Task</div>
          <div className="detail-content">{activeLog.content}</div>
          <div className="detail-meta">{activeLog.taskId}</div>
        </div>
      )}
    </div>
  )
}
