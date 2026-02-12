import { useState, useEffect } from 'react'
import AppLayout from './layout/AppLayout'
import { Device, Report } from './types'
import { mockApi } from './api/mock'
import { ipcApi } from './api/ipc'

// Check if running in Electron with IPC support
const isElectron = !!(window as any).electron

console.log('[App] Loading App component, isElectron:', isElectron)

function App(): JSX.Element {
  console.log('[App] Rendering App component')
  const [devices, setDevices] = useState<Device[]>([])
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    console.log('[App] useEffect triggered')
    
    // Initial data load
    const loadInitialData = async () => {
      try {
        console.log('[App] Loading initial data, isElectron:', isElectron)
        if (!isElectron) {
          // Use mock API for initial data
          const [deviceList, reportList] = await Promise.all([
            mockApi.getDevices(),
            mockApi.getReports()
          ])
          console.log('[App] Mock data loaded:', deviceList.length, 'devices,', reportList.length, 'reports')
          setDevices(deviceList)
          setReports(reportList)
        } else {
          // Request data via IPC
          console.log('[App] Requesting data via IPC')
          ipcApi.getDevices().then((devs) => {
            console.log('[App] IPC devices received:', devs.length)
            setDevices(devs)
          })
          ipcApi.getReports().then(setReports)
        }
      } catch (error) {
        console.error('[App] Failed to load initial data:', error)
      }
    }

    loadInitialData()

    // Set up IPC listeners if in Electron
    let unsubscribers: Array<() => void> = []
    
    if (isElectron) {
      console.log('[App] Setting up IPC listeners')
      // Listen for device list updates
      const unsubDevice = ipcApi.onDeviceList((newDevices) => {
        console.log('[App] Device list updated:', newDevices.length)
        setDevices(newDevices)
      })

      unsubscribers = [unsubDevice]
    }

    // Refresh data every 5 seconds (for mock API)
    const interval = setInterval(() => {
      if (!isElectron) {
        loadInitialData()
      }
    }, 5000)

    return () => {
      console.log('[App] Cleaning up')
      clearInterval(interval)
      unsubscribers.forEach(unsub => unsub?.())
    }
  }, [])

  console.log('[App] Rendering AppLayout with', devices.length, 'devices')
  return (
    <AppLayout 
      devices={devices}
      reports={reports}
    />
  )
}

export default App
