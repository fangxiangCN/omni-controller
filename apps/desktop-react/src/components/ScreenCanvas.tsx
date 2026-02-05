import { useEffect, useRef } from 'react'
import { ScrcpyOptions3_1 } from '@yume-chan/scrcpy'
import { PushReadableStream } from '@yume-chan/stream-extra'
import { IPC_DEVICE_FRAME, type DeviceFramePayload } from '@omni/shared'
import { ipcOn } from '../ipc'
import { AndroidStreamDecoder } from './android-stream-decoder'
import './ScreenCanvas.less'

type ScreenCanvasProps = {
  deviceId?: string
}

export function ScreenCanvas({ deviceId }: ScreenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const decoderRef = useRef<AndroidStreamDecoder | null>(null)
  const h264Controller = useRef<ReadableStreamDefaultController<Uint8Array> | null>(null)
  const decoderStarted = useRef(false)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d')
    }
  }, [])

  useEffect(() => {
    const cleanup = ipcOn<DeviceFramePayload>(IPC_DEVICE_FRAME, (payload) => {
      if (!payload) return
      if (deviceId && payload.deviceId && deviceId !== payload.deviceId) return

      if (payload.format === 'h264') {
        if (!decoderStarted.current) {
          decoderStarted.current = true
          decoderRef.current = new AndroidStreamDecoder()
          const stream = new PushReadableStream<Uint8Array>(async (controller) => {
            h264Controller.current = controller
          })
          const options = new ScrcpyOptions3_1({
            audio: false,
            videoBitRate: 8000000,
            maxSize: 0,
            clipboardAutosync: false,
            stayAwake: false,
          })
          decoderRef.current
            .attach(stream, options)
            .catch(() => {
              decoderStarted.current = false
            })
        }
        h264Controller.current?.enqueue(payload.data)
        return
      }

      if (payload.format === 'jpeg') {
        const ctx = ctxRef.current
        const canvas = canvasRef.current
        if (!ctx || !canvas) return
        const blob = new Blob([payload.data], { type: 'image/jpeg' })
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(url)
          canvas.width = img.width
          canvas.height = img.height
          ctx.clearRect(0, 0, img.width, img.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = url
      }
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [deviceId])

  return (
    <div className="screen-canvas">
      <canvas ref={canvasRef} />
    </div>
  )
}
