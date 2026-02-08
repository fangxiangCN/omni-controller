import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import type { DeviceFrame, DeviceSize } from '@omni/shared-types'
import type { AdbClient } from '../adb/adb-client'
import {
  AndroidKeyCode,
  AndroidKeyEventAction,
  AndroidMotionEventAction,
  AndroidMotionEventButton,
  ScrcpyAudioCodec,
  ScrcpyControlMessageWriter,
  ScrcpyOptions3_1,
} from '@yume-chan/scrcpy'
import {
  BufferedReadableStream,
  PushReadableStream,
  ReadableStream,
  ReadableWritablePair,
  WritableStream,
  Consumable,
} from '@yume-chan/stream-extra'
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
  private control?: { writer: ScrcpyControlMessageWriter }
  private controlReady?: Promise<void>
  private controlReadyResolve?: () => void
  private scid = ''
  private options: ScrcpyOptions3_1<any>
  private videoConnected = false

  constructor(
    private deviceId: string,
    private adb: AdbClient,
    private scrcpyOptions?: ScrcpyOptions,
  ) {
    this.scid = buildScid(deviceId)
    this.options = new ScrcpyOptions3_1({
      audio: scrcpyOptions?.audio ?? false,
      videoBitRate: scrcpyOptions?.videoBitRate ?? 8000000,
      maxSize: scrcpyOptions?.maxSize ?? 0,
      clipboardAutosync: false,
      stayAwake: false,
    })
    this.options.value.scid = this.scid
  }

  async start(): Promise<void> {
    const jarPath = resolveScrcpyJarPath()
    await this.adb.push(this.deviceId, jarPath, SCRCPY_REMOTE_PATH)

    const args = this.options.serialize()

    const cmd = `CLASSPATH=${SCRCPY_REMOTE_PATH} app_process /system/bin com.genymobile.scrcpy.Server 3.1 ${args.join(
      ' ',
    )}`

    const socket = await this.adb.shellSocket(this.deviceId, cmd)
    socket.on('readable', () => {
      // keep stream flowing; log output in caller if needed
      socket.read()
    })
    socket.on('error', () => {
      // ignore here; upstream handles device errors
    })
  }

  async startStream(onFrame: (frame: DeviceFrame) => void): Promise<void> {
    const remote = `localabstract:scrcpy_${this.scid}`
    const port = await this.adb.reverseTcp(this.deviceId, remote)

    this.controlReady = new Promise((resolve) => {
      this.controlReadyResolve = resolve
    })

    const server = net.createServer((socket) => {
      if (!this.control) {
        // video socket is the first connection
        if (!this.server) return
        if (!this.videoConnected) {
          this.videoConnected = true
          socket.on('data', (chunk) => {
            const buf = typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk as any)
            onFrame({ data: new Uint8Array(buf), format: 'h264' })
          })
          socket.on('close', () => {})
          return
        }

        // audio socket and control socket orders are not guaranteed
        let isAudio = false
        this.detectAudioStream(socketToReadableStream(socket)).then((value) => {
          if (value.audio) {
            isAudio = true
          }
        })
        setTimeout(() => {
          if (!isAudio) {
            this.createControl(socket)
          }
        }, 1000)
      }
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
    this.control = undefined
    this.controlReady = undefined
    this.controlReadyResolve = undefined
    this.videoConnected = false
  }

  async tap(x: number, y: number, size: DeviceSize): Promise<void> {
    const writer = await this.getControlWriter()
    writer.injectTouch({
      action: AndroidMotionEventAction.Down,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: x,
      pointerY: y,
      pressure: 1,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 1,
    } as any)
    writer.injectTouch({
      action: AndroidMotionEventAction.Up,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: x,
      pointerY: y,
      pressure: 0,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 0,
    } as any)
  }

  async scroll(dx: number, dy: number, size: DeviceSize): Promise<void> {
    const writer = await this.getControlWriter()
    const centerX = Math.round(size.width / 2)
    const centerY = Math.round(size.height / 2)
    writer.injectScroll({
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: centerX,
      pointerY: centerY,
      scrollX: -dx / 100,
      scrollY: -dy / 100,
      buttons: 0,
    } as any)
  }

  async type(text: string): Promise<void> {
    const writer = await this.getControlWriter()
    writer.injectText(text)
  }

  async longPress(x: number, y: number, size: DeviceSize, durationMs = 500): Promise<void> {
    const writer = await this.getControlWriter()
    writer.injectTouch({
      action: AndroidMotionEventAction.Down,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: x,
      pointerY: y,
      pressure: 1,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 1,
    } as any)
    await delay(durationMs)
    writer.injectTouch({
      action: AndroidMotionEventAction.Up,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: x,
      pointerY: y,
      pressure: 0,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 0,
    } as any)
  }

  async swipe(
    start: [number, number],
    end: [number, number],
    size: DeviceSize,
    durationMs = 300,
  ): Promise<void> {
    const writer = await this.getControlWriter()
    writer.injectTouch({
      action: AndroidMotionEventAction.Down,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: start[0],
      pointerY: start[1],
      pressure: 1,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 1,
    } as any)
    await delay(durationMs)
    writer.injectTouch({
      action: AndroidMotionEventAction.Move,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: end[0],
      pointerY: end[1],
      pressure: 1,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 1,
    } as any)
    writer.injectTouch({
      action: AndroidMotionEventAction.Up,
      pointerId: 1n,
      screenWidth: size.width,
      screenHeight: size.height,
      pointerX: end[0],
      pointerY: end[1],
      pressure: 0,
      actionButton: AndroidMotionEventButton.Primary,
      buttons: 0,
    } as any)
  }
  async back(): Promise<void> {
    const writer = await this.getControlWriter()
    writer.injectKeyCode({
      action: AndroidKeyEventAction.Down,
      keyCode: AndroidKeyCode.AndroidBack,
      repeat: 0,
      metaState: 0,
    })
    writer.injectKeyCode({
      action: AndroidKeyEventAction.Up,
      keyCode: AndroidKeyCode.AndroidBack,
      repeat: 0,
      metaState: 0,
    })
  }

  async backspace(): Promise<void> {
    const writer = await this.getControlWriter()
    writer.injectKeyCode({
      action: AndroidKeyEventAction.Down,
      keyCode: AndroidKeyCode.Backspace,
      repeat: 0,
      metaState: 0,
    })
    writer.injectKeyCode({
      action: AndroidKeyEventAction.Up,
      keyCode: AndroidKeyCode.Backspace,
      repeat: 0,
      metaState: 0,
    })
  }

  private async getControlWriter(): Promise<ScrcpyControlMessageWriter> {
    if (this.control?.writer) return this.control.writer
    if (!this.controlReady) {
      throw new Error('scrcpy control channel not initialized')
    }

    await waitFor(this.controlReady, 3000, 'scrcpy control channel not ready')
    if (!this.control?.writer) {
      throw new Error('scrcpy control channel not ready')
    }
    return this.control.writer
  }

  private async detectAudioStream(stream: ReadableStream<Uint8Array>) {
    const buffered = new BufferedReadableStream(stream)
    const buffer = await buffered.readExactly(4)
    const codecMetadataValue = getUint32BigEndian(buffer, 0)

    const readableStream = new PushReadableStream<Uint8Array>(async (controller) => {
      await controller.enqueue(buffer)
      const rest = buffered.release()
      const reader = rest.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const buf = typeof value === 'string' ? Buffer.from(value) : Buffer.from(value as any)
        await controller.enqueue(new Uint8Array(buf))
      }
    })

    const isAudio =
      codecMetadataValue === 0x00_00_00_00 ||
      codecMetadataValue === ScrcpyAudioCodec.Opus.metadataValue

    return {
      audio: isAudio,
      stream: readableStream,
    }
  }

  private createControl(socket: net.Socket) {
    const controlStream = socketToReadableWritablePair(socket)
    const writer = new ScrcpyControlMessageWriter(controlStream.writable.getWriter(), this.options)
    this.control = { writer }
    this.controlReadyResolve?.()
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

function socketToReadableStream(socket: net.Socket) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      socket.on('data', (data) => {
        const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data as any)
        controller.enqueue(new Uint8Array(buf))
      })
      socket.on('end', () => controller.close())
      socket.on('error', (e) => controller.error(e))
    },
    cancel() {
      socket.destroy()
    },
  })
}

function socketToWritableStream(socket: net.Socket) {
  return new WritableStream<Consumable<Uint8Array>>({
    write(chunk) {
      return new Promise((resolve, reject) => {
        socket.write(chunk.value, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    },
    close() {
      socket.end()
    },
    abort() {
      socket.destroy()
    },
  })
}

function socketToReadableWritablePair(
  socket: net.Socket,
): ReadableWritablePair<Uint8Array, Consumable<Uint8Array>> {
  return {
    readable: socketToReadableStream(socket),
    writable: socketToWritableStream(socket),
  }
}

async function waitFor(promise: Promise<void>, timeoutMs: number, message: string) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  try {
    await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs)
      }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
