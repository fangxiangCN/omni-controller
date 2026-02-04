import Adb from '@devicefarmer/adbkit'
import getPort from 'get-port'
import type { Duplex } from 'node:stream'

export type AdbDeviceInfo = {
  id: string
  state: string
}

// Reference: references/aya/src/main/lib/adb/base.ts
export class AdbClient {
  private client = Adb.createClient()

  async listDevices(): Promise<AdbDeviceInfo[]> {
    const devices = await this.client.listDevices()
    return devices.map((d) => ({ id: d.id, state: d.type }))
  }

  async shell(deviceId: string, cmd: string): Promise<string> {
    const device = this.client.getDevice(deviceId)
    const socket = await device.shell(cmd)
    const output = await Adb.util.readAll(socket)
    return output.toString().trim()
  }

  async shellRaw(deviceId: string, cmd: string): Promise<Buffer> {
    const device = this.client.getDevice(deviceId)
    const socket = await device.shell(cmd)
    const output = await Adb.util.readAll(socket)
    return Buffer.from(output)
  }

  async shellSocket(deviceId: string, cmd: string): Promise<Duplex> {
    const device = this.client.getDevice(deviceId)
    return device.shell(cmd)
  }

  async reverseTcp(deviceId: string, remote: string): Promise<number> {
    const device = this.client.getDevice(deviceId)
    const reverses = await device.listReverses()
    for (const reverse of reverses) {
      if (reverse.remote === remote) {
        return Number(reverse.local.replace('tcp:', ''))
      }
    }
    const port = await getPort()
    const local = `tcp:${port}`
    await device.reverse(remote, local)
    return port
  }

  async push(deviceId: string, localPath: string, remotePath: string): Promise<void> {
    const device = this.client.getDevice(deviceId)
    const transfer = await device.push(localPath, remotePath)
    await new Promise<void>((resolve, reject) => {
      transfer.on('end', () => resolve())
      transfer.on('error', (err) => reject(err))
    })
  }
}
