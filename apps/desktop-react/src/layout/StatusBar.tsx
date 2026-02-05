import { useMemo } from 'react'
import { useAppStore } from '../store/app'
import './StatusBar.less'

export function StatusBar() {
  const devices = useAppStore((state) => state.devices)
  const activeDeviceId = useAppStore((state) => state.activeDeviceId)
  const taskState = useAppStore((state) => state.taskState)

  const activeDevice = useMemo(
    () => devices.find((device) => device.id === activeDeviceId),
    [devices, activeDeviceId],
  )
  const isConnected = Boolean(activeDevice)
  const modelName = process.env.MIDSCENE_MODEL_NAME || 'Unset'
  const taskCount = taskState.status === 'running' ? 1 : 0

  return (
    <div className="status-bar">
      <div className="status-section">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="status-section">
        {activeDevice ? activeDevice.name : 'No device'}
      </div>
      <div className="status-section">{activeDevice ? activeDevice.type : '-'}</div>
      <div className="status-section">{modelName}</div>
      <div className="status-section">{taskCount} tasks</div>
    </div>
  )
}
