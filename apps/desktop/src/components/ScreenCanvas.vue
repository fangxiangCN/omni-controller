<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IPC_DEVICE_FRAME } from '@omni/shared'

type Frame = {
  data: Uint8Array
  format: 'h264' | 'jpeg'
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const props = defineProps<{ deviceId?: string }>()
let ctx: CanvasRenderingContext2D | null = null

function drawJpeg(frame: Frame) {
  if (!ctx || !canvasRef.value) return
  const blob = new Blob([frame.data], { type: 'image/jpeg' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onload = () => {
    URL.revokeObjectURL(url)
    canvasRef.value!.width = img.width
    canvasRef.value!.height = img.height
    ctx!.clearRect(0, 0, img.width, img.height)
    ctx!.drawImage(img, 0, 0)
  }
  img.src = url
}

function handleFrame(_event: unknown, payload: Frame & { deviceId?: string }) {
  if (!payload) return
  if (props.deviceId && payload.deviceId && props.deviceId !== payload.deviceId) {
    return
  }
  if (payload.format === 'h264') {
    return
  }
  if (payload.format === 'jpeg') {
    drawJpeg(payload)
  }
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
  }
  const ipc = (window as any)?.ipcRenderer
  if (ipc?.on) {
    ipc.on(IPC_DEVICE_FRAME, handleFrame)
  }
})

onUnmounted(() => {
  const ipc = (window as any)?.ipcRenderer
  if (ipc?.removeListener) {
    ipc.removeListener(IPC_DEVICE_FRAME, handleFrame)
  }
})
</script>

<template>
  <div class="screen-canvas">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.screen-canvas {
  height: 100%;
  width: 100%;
  border: 1px dashed #2a3240;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b94a7;
  background: #0b0f14;
}
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
