import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import type { DeviceFrame } from '@omni/shared'
import type { AdbClient } from '../adb/adb-client'
import { getUint32BigEndian } from '@yume-chan/no-data-view'

export type ScrcpyOptions = {
  videoBitRate?: number
  maxSize?: number
  audio?: boolean
}

const SCRCPY_REMOTE_PATH = '/data/local/tmp/omni/scrcpy.jar'

// Reference: references/aya/src/main/lib/adb/scrcpy.ts
// Reference: references/aya/src/renderer/screencast/lib/ScrcpyClient.ts
export class ScrcpyClient {
  private server?: net.Server
  private scid = ''
  constructor(
    private deviceId: string,
    private adb: AdbClient,
    private options?: ScrcpyOptions,
  ) {
    this.scid = buildScid(deviceId)
  }

  async start(): Promise<void> {
    const jarPath = resolveScrcpyJarPath()
    await this.adb.push(this.deviceId, jarPath, SCRCPY_REMOTE_PATH)

    const args: string[] = []
    if (this.options?.videoBitRate) args.push(`--bit-rate=${this.options.videoBitRate}`)
    if (this.options?.maxSize) args.push(`--max-size=${this.options.maxSize}`)
    if (this.options?.audio === false) args.push('--no-audio')

    const cmd = `CLASSPATH=${SCRCPY_REMOTE_PATH} app_process /system/bin com.genymobile.scrcpy.Server 3.1 ${args.join(
      ' ',
    )}`
    await this.adb.shell(this.deviceId, cmd)
  }

  async startStream(onFrame: (frame: DeviceFrame) => void): Promise<void> {
    const remote = `localabstract:scrcpy_${this.scid}`
    const port = await this.adb.reverseTcp(this.deviceId, remote)
    const server = net.createServer((socket) => {
      let isVideoSocket = false
      let headerChecked = false

      socket.on('data', (chunk) => {
        if (!headerChecked) {
          headerChecked = true
          // Detect audio socket by 4-byte metadata (see Aya detectAudioStream)
          const metadata = getUint32BigEndian(chunk, 0)
          const isAudio = metadata !== 0x00_00_00_00
          if (!isAudio) {
            isVideoSocket = true
          }
        }

        if (isVideoSocket) {
          onFrame({ data: new Uint8Array(chunk), format: 'h264' })
        }
      })
    })
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, () => resolve())
    })
    this.server = server
    await this.start()
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close()
      this.server = undefined
    }
  }
}

function resolveScrcpyJarPath(): string {
  const root = process.cwd()
  const jarPath = path.resolve(root, 'resources', 'bin', 'android', 'scrcpy.jar')
  if (!fs.existsSync(jarPath)) {
    throw new Error(`scrcpy.jar not found at ${jarPath}`)
  }
  return jarPath
}

function buildScid(deviceId: string): string {
  let hash = 0
  for (let i = 0; i < deviceId.length; i += 1) {
    hash = (hash * 31 + deviceId.charCodeAt(i)) | 0
  }
  const scid = Math.abs(hash) % 999999
  return String(scid).padStart(8, '0')
}
