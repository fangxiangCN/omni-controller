import { useState } from 'react'
import { Layout, ConfigProvider } from 'antd'
import { Device, Report } from '../types'
import TitleBar from './TitleBar'
import DevicePanel from './DevicePanel'
import MainWorkspace from './MainWorkspace'
import InspectorPanel from './InspectorPanel'
import StatusBar from './StatusBar'
import './AppLayout.css'

const { Content, Sider } = Layout

interface AppLayoutProps {
  devices: Device[]
  reports: Report[]
}

function AppLayout({ devices, reports }: AppLayoutProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(
    devices.find(d => d.status === 'connected')?.id || null
  )
  const [currentView, setCurrentView] = useState<'playground' | 'report' | 'recorder'>('playground')

  const activeDevice = devices.find(d => d.id === activeDeviceId)

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: '#0d0d1a',
          colorBgElevated: '#0d0d1a',
          colorText: 'rgba(255,255,255,0.85)',
          colorTextSecondary: 'rgba(255,255,255,0.45)',
          colorBorder: 'rgba(255,255,255,0.1)',
        }
      }}
    >
      <Layout 
        className="app-layout" 
        style={{ 
          height: '100vh', 
          background: '#1a1a2e',
          overflow: 'hidden'
        }}
      >
        <TitleBar />
        
        <Layout style={{ background: 'transparent', overflow: 'hidden' }}>
          <Sider
            width={280}
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{
              background: '#0d0d1a',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              overflow: 'auto'
            }}
          >
            <DevicePanel
              devices={devices}
              activeDeviceId={activeDeviceId}
              onSelectDevice={setActiveDeviceId}
            />
          </Sider>

          <Content style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

          <Sider
            width={320}
            style={{
              background: '#0d0d1a',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              overflow: 'auto'
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
