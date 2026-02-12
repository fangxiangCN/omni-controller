import { useState, useEffect } from 'react'
import { Layout, ConfigProvider } from 'antd'
import { Device, Report } from '../types'
import { antdThemeTokens } from '../theme'
import TitleBar from './TitleBar'
import DevicePanel from './DevicePanel'
import MainWorkspace from './MainWorkspace'
import InspectorPanel from './InspectorPanel'
import StatusBar from './StatusBar'

const { Content, Sider } = Layout

interface AppLayoutProps {
  devices: Device[]
  reports: Report[]
}

function AppLayout({ devices, reports }: AppLayoutProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'playground' | 'report' | 'recorder'>('playground')

  // Update active device when devices change
  useEffect(() => {
    if (!activeDeviceId && devices.length > 0) {
      const connected = devices.find(d => d.status === 'connected')
      setActiveDeviceId(connected?.id || devices[0]?.id || null)
    }
  }, [devices, activeDeviceId])

  const activeDevice = devices.find(d => d.id === activeDeviceId)

  return (
    <ConfigProvider theme={antdThemeTokens}>
      <Layout 
        className="app-layout" 
        style={{ 
          height: '100vh',
          background: 'var(--color-background)',
          overflow: 'hidden',
          fontFamily: 'var(--font-family-sans)',
        }}
      >
        <TitleBar />
        
        <Layout style={{ background: 'transparent', overflow: 'hidden' }}>
          {/* Left Sidebar - Device Panel */}
          <Sider
            width={280}
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{
              background: 'var(--color-background-secondary)',
              borderRight: '1px solid var(--color-border)',
              overflow: 'auto',
            }}
            collapsible
            trigger={null}
          >
            <DevicePanel
              devices={devices}
              activeDeviceId={activeDeviceId}
              onSelectDevice={setActiveDeviceId}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed(!collapsed)}
            />
          </Sider>

          {/* Main Content Area */}
          <Content 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              background: 'var(--color-background)',
            }}
          >
            <MainWorkspace
              currentView={currentView}
              onChangeView={setCurrentView}
              activeDevice={activeDevice}
              reports={reports}
            />
            
            <StatusBar
              deviceCount={devices.length}
              activeDevice={activeDevice}
              currentView={currentView}
            />
          </Content>

          {/* Right Sidebar - Inspector Panel */}
          <Sider
            width={320}
            style={{
              background: 'var(--color-background-secondary)',
              borderLeft: '1px solid var(--color-border)',
              overflow: 'auto',
            }}
          >
            <InspectorPanel
              activeDevice={activeDevice}
              currentView={currentView}
            />
          </Sider>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default AppLayout
