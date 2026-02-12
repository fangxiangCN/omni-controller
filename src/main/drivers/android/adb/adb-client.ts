import type { Duplex } from 'node:stream'

export type AdbDeviceInfo = {
  id: string
  state: string
}

export class AdbClient {
  private client: any
  private adbPath?: string
  private adbkit: any

  constructor(adbPath?: string) {
    this.adbPath = adbPath
    this.client = null
  }

  /**
   * Lazy initialization of adbkit client
   */
  private async initClient(): Promise<void> {
    if (this.client) return

    try {
      // Dynamic import to handle CommonJS module
      const adbkitModule = await import('@devicefarmer/adbkit')
      console.log('[ADB] Imported adbkit module:', Object.keys(adbkitModule))
      
      // The module structure: { default: { default: {...}, Client: ..., Adb: ..., ... } }
      // Access the nested default which contains the actual exports
      let adbkit = adbkitModule.default
      
      // If default has a nested default (double wrapped), unwrap it
      if (adbkit?.default) {
        adbkit = adbkit.default
      }
      
      console.log('[ADB] adbkit keys:', Object.keys(adbkit || {}))
      
      // Get Client class - it's a getter on the default export
      const Client = adbkit?.Client
      const createClient = adbkit?.createClient
      
      if (createClient && typeof createClient === 'function') {
        this.adbkit = adbkit
        this.client = createClient({ bin: this.adbPath })
        console.log('[ADB] Client initialized via createClient')
      } else if (Client) {
        // Use Client class directly
        this.adbkit = adbkit
        this.client = new Client({ bin: this.adbPath })
        console.log('[ADB] Client initialized via new Client()')
      } else {
        console.error('[ADB] Available keys in module:', Object.keys(adbkitModule))
        console.error('[ADB] Available keys in adbkit:', Object.keys(adbkit || {}))
        throw new Error('Failed to import createClient or Client from @devicefarmer/adbkit')
      }
      
      console.log('[ADB] Client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize ADB client:', error)
      throw new Error('ADB initialization failed. Please check ADB installation.')
    }
  }

  async listDevices(): Promise<AdbDeviceInfo[]> {
    try {
      await this.initClient()
      const devices = await this.client.listDevices()
      return devices.map((d: { id: string; type: string }) => ({
        id: d.id,
        state: d.type,
      }))
    } catch (error) {
      console.error('Error listing devices:', error)
      return []
    }
  }

  async shell(deviceId: string, cmd: string): Promise<string> {
    try {
      await this.initClient()
      const device = this.client.getDevice(deviceId)
      const socket = await device.shell(cmd)
      
      // Try different paths to readAll
      let readAll = this.adbkit.util?.readAll || 
                    this.adbkit.Adb?.util?.readAll ||
                    (this.adbkit as any).readAll
      
      if (!readAll) {
        console.error('[ADB] readAll not available, trying fallback...')
        // Fallback: manually read from stream
        const chunks: Buffer[] = []
        for await (const chunk of socket) {
          chunks.push(Buffer.from(chunk))
        }
        return Buffer.concat(chunks).toString().trim()
      }
      
      const output = await readAll(socket)
      return output.toString().trim()
    } catch (error) {
      console.error(`Error executing shell command "${cmd}":`, error)
      return ''
    }
  }

  async shellRaw(deviceId: string, cmd: string): Promise<Buffer> {
    try {
      await this.initClient()
      const device = this.client.getDevice(deviceId)
      const socket = await device.shell(cmd)
      
      // Try different paths to readAll
      let readAll = this.adbkit.util?.readAll || 
                    this.adbkit.Adb?.util?.readAll ||
                    (this.adbkit as any).readAll
      
      if (!readAll) {
        console.error('[ADB] readAll not available, trying fallback...')
        // Fallback: manually read from stream
        const chunks: Buffer[] = []
        for await (const chunk of socket) {
          chunks.push(Buffer.from(chunk))
        }
        return Buffer.concat(chunks)
      }
      
      const output = await readAll(socket)
      return Buffer.from(output)
    } catch (error) {
      console.error(`Error executing shell command "${cmd}":`, error)
      return Buffer.alloc(0)
    }
  }

  async shellSocket(deviceId: string, cmd: string): Promise<Duplex> {
    await this.initClient()
    const device = this.client.getDevice(deviceId)
    return device.shell(cmd)
  }

  async reverseTcp(deviceId: string, remote: string): Promise<number> {
    await this.initClient()
    const device = this.client.getDevice(deviceId)
    const reverses = await device.listReverses()
    for (const reverse of reverses) {
      if (reverse.remote === remote) {
        return Number(reverse.local.replace('tcp:', ''))
      }
    }
    const { default: getPort } = await import('get-port')
    const port = await getPort()
    const local = `tcp:${port}`
    await device.reverse(remote, local)
    return port
  }

  async push(deviceId: string, localPath: string, remotePath: string): Promise<void> {
    await this.initClient()
    const device = this.client.getDevice(deviceId)
    const transfer = await device.push(localPath, remotePath)
    await new Promise<void>((resolve, reject) => {
      transfer.on('end', () => resolve())
      transfer.on('error', (err: Error) => reject(err))
    })
  }
}
