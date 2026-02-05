import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useLayoutStore } from '../store/layout'
import { useEffect } from 'react'
import { useAppStore } from '../store/app'
import { DevicePanel } from './DevicePanel'
import { InspectorPanel } from './InspectorPanel'
import { MainWorkspace } from './MainWorkspace'
import { StatusBar } from './StatusBar'
import { TitleBar } from './TitleBar'
import './AppLayout.less'

export function AppLayout() {
  const initIpc = useAppStore((state) => state.initIpc)
  const {
    devicePanelWidth,
    inspectorPanelWidth,
    devicePanelCollapsed,
    inspectorPanelCollapsed,
    theme,
    setDevicePanelCollapsed,
    setInspectorPanelCollapsed,
    setDevicePanelWidth,
    setInspectorPanelWidth,
  } = useLayoutStore()

  useEffect(() => {
    initIpc()
  }, [initIpc])

  return (
    <div className="app-layout" data-theme={theme}>
      <TitleBar />
      <PanelGroup direction="horizontal" className="main-layout">
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={25}
          collapsible
          collapsedSize={3}
          onCollapse={() => setDevicePanelCollapsed(true)}
          onExpand={() => setDevicePanelCollapsed(false)}
          onResize={(size) => setDevicePanelWidth(size)}
        >
          <DevicePanel collapsed={devicePanelCollapsed} width={devicePanelWidth} />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={60} minSize={40}>
          <MainWorkspace />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          collapsible
          collapsedSize={3}
          onCollapse={() => setInspectorPanelCollapsed(true)}
          onExpand={() => setInspectorPanelCollapsed(false)}
          onResize={(size) => setInspectorPanelWidth(size)}
        >
          <InspectorPanel
            collapsed={inspectorPanelCollapsed}
            width={inspectorPanelWidth}
          />
        </Panel>
      </PanelGroup>
      <StatusBar />
    </div>
  )
}
