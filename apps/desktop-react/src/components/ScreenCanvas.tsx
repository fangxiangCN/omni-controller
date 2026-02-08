import { useEffect, useRef } from 'react'
import { ScrcpyOptions3_1 } from '@yume-chan/scrcpy'
import { PushReadableStream } from '@yume-chan/stream-extra'
import { IPC_DEVICE_FRAME, type DeviceFramePayload } from '@omni/ipc-contract'
import { ipcOn } from '../ipc'
import { AndroidStreamDecoder } from './android-stream-decoder'
import { useAppStore } from '../store/app'
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
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const lastThumbAtRef = useRef(0)
  const setDeviceThumbnail = useAppStore((state) => state.setDeviceThumbnail)

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
          videoRef.current = decoderRef.current.element
          const renderFrame = () => {
            const canvas = canvasRef.current
            const ctx = ctxRef.current
            const video = videoRef.current
            if (!canvas || !ctx || !video) return
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              ctx.drawImage(video, 0, 0)
              const now = Date.now()
              if (now - lastThumbAtRef.current > 1000 && payload.deviceId) {
                lastThumbAtRef.current = now
                setDeviceThumbnail(payload.deviceId, canvas.toDataURL('image/jpeg', 0.6))
              }
            }
            video.requestVideoFrameCallback(() => renderFrame())
          }
          videoRef.current?.requestVideoFrameCallback(() => renderFrame())
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
          if (payload.deviceId) {
            setDeviceThumbnail(payload.deviceId, canvas.toDataURL('image/jpeg', 0.6))
          }
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
