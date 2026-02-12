import { Device, Task, Report, TaskLog } from '../types'

// Mock data for devices
const mockDevices: Device[] = [
  {
    id: 'android-001',
    name: 'Pixel 7 Pro',
    type: 'android',
    status: 'connected',
    resolution: '1440x3120',
    osVersion: 'Android 14'
  },
  {
    id: 'android-002',
    name: 'Samsung Galaxy S24',
    type: 'android',
    status: 'busy',
    resolution: '1080x2340',
    osVersion: 'Android 14'
  },
  {
    id: 'android-003',
    name: 'Xiaomi 14 Ultra',
    type: 'android',
    status: 'disconnected',
    resolution: '1440x3200',
    osVersion: 'Android 14'
  },
  {
    id: 'ios-001',
    name: 'iPhone 15 Pro',
    type: 'ios',
    status: 'connected',
    resolution: '1179x2556',
    osVersion: 'iOS 17'
  },
  {
    id: 'ios-002',
    name: 'iPhone 14',
    type: 'ios',
    status: 'disconnected',
    resolution: '1170x2532',
    osVersion: 'iOS 16'
  }
]

// Generate mock logs
const generateMockLogs = (count: number): TaskLog[] => {
  const logs: TaskLog[] = []
  const types: TaskLog['type'][] = ['info', 'error', 'success', 'warning']
  const messages = [
    'Initializing device connection...',
    'Device connected successfully',
    'Starting task execution',
    'Analyzing screen content',
    'Executing action: tap',
    'Action completed successfully',
    'Waiting for screen update',
    'Screen captured',
    'Processing with AI model...',
    'Task completed successfully',
    'Error: Element not found',
    'Retrying operation...',
    'Network latency detected',
    'Screenshot saved',
    'Report generated'
  ]

  const now = Date.now()
  for (let i = 0; i < count; i++) {
    logs.push({
      type: types[Math.floor(Math.random() * types.length)],
      content: messages[Math.floor(Math.random() * messages.length)],
      timestamp: now - (count - i) * 1000
    })
  }
  return logs
}

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: 'task-001',
    type: 'automation',
    status: 'running',
    prompt: 'Open the browser and search for weather in Beijing',
    startTime: Date.now() - 30000,
    logs: generateMockLogs(8)
  },
  {
    id: 'task-002',
    type: 'assertion',
    status: 'completed',
    prompt: 'Verify the calculator app shows correct result for 2+2',
    startTime: Date.now() - 600000,
    endTime: Date.now() - 595000,
    logs: generateMockLogs(12)
  },
  {
    id: 'task-003',
    type: 'automation',
    status: 'failed',
    prompt: 'Navigate to settings and enable dark mode',
    startTime: Date.now() - 1200000,
    endTime: Date.now() - 1195000,
    logs: generateMockLogs(6)
  },
  {
    id: 'task-004',
    type: 'data-extraction',
    status: 'idle',
    prompt: 'Extract all contacts from the contacts app',
    logs: []
  }
]

// Mock data for reports
const mockReports: Report[] = [
  {
    id: 'report-001',
    title: 'App Navigation Test - 2024-02-12',
    createdAt: Date.now() - 86400000,
    path: '/reports/report-001.html',
    summary: 'Successfully navigated through 15 screens with 98% accuracy'
  },
  {
    id: 'report-002',
    title: 'Login Flow Verification - 2024-02-11',
    createdAt: Date.now() - 172800000,
    path: '/reports/report-002.html',
    summary: 'Login flow completed in 3.2s average'
  },
  {
    id: 'report-003',
    title: 'E-commerce Checkout Test - 2024-02-10',
    createdAt: Date.now() - 259200000,
    path: '/reports/report-003.html',
    summary: 'End-to-end checkout flow successful'
  },
  {
    id: 'report-004',
    title: 'Search Functionality Test - 2024-02-09',
    createdAt: Date.now() - 345600000,
    path: '/reports/report-004.html',
    summary: 'Search results accuracy: 95%'
  }
]

export const mockApi = {
  // Device APIs
  getDevices: async (): Promise<Device[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Randomly change status for demo
    return mockDevices.map(device => ({
      ...device,
      status: Math.random() > 0.7 
        ? (['connected', 'disconnected', 'busy'] as const)[Math.floor(Math.random() * 3)]
        : device.status
    }))
  },

  selectDevice: async (deviceId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('Device selected:', deviceId)
  },

  // Task APIs
  getTasks: async (): Promise<Task[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockTasks
  },

  startTask: async (prompt: string): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newTask: Task = {
      id: `task-${Date.now()}`,
      type: 'automation',
      status: 'running',
      prompt,
      startTime: Date.now(),
      logs: [{
        type: 'info',
        content: 'Task started',
        timestamp: Date.now()
      }]
    }
    mockTasks.unshift(newTask)
    return newTask
  },

  stopTask: async (taskId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      task.status = 'completed'
      task.endTime = Date.now()
    }
  },

  // Report APIs
  getReports: async (): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockReports
  },

  deleteReport: async (reportId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockReports.findIndex(r => r.id === reportId)
    if (index > -1) {
      mockReports.splice(index, 1)
    }
  }
}
