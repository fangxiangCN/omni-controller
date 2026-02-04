<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from './stores/app'
import ScreenCanvas from './components/ScreenCanvas.vue'
import { IPC_START_TASK } from '@omni/shared'
import { ipcSend } from './ipc'

const prompt = ref('')
const store = useAppStore()

if (store.devices.length === 0) {
  store.setDevices([
    { id: 'device-1', name: 'Android-001', type: 'android' },
    { id: 'device-2', name: 'HarmonyOS-001', type: 'ohos' },
    { id: 'web-1', name: 'Web-Playwright', type: 'web' },
  ])
}

onMounted(() => {
  store.initIpc()
})

const menuValue = computed(() => store.activeDeviceId || 'device-1')
const timeline = computed(() =>
  store.logs.length
    ? store.logs
    : [
        { type: 'thought', content: '等待任务输入' },
        { type: 'plan', content: '—' },
        { type: 'action', content: '—' },
      ],
)

function startTask() {
  if (!prompt.value.trim()) return
  ipcSend(IPC_START_TASK, {
    instruction: prompt.value.trim(),
    deviceId: store.activeDeviceId,
  })
}
</script>

<template>
  <t-layout class="app">
    <t-aside class="sidebar">
      <div class="panel-title">Devices</div>
      <t-menu
        theme="dark"
        :value="menuValue"
        @change="(v) => store.setActiveDevice(String(v))"
      >
        <t-menu-item v-for="d in store.devices" :key="d.id" :value="d.id">
          {{ d.name }}
        </t-menu-item>
      </t-menu>
    </t-aside>

    <t-layout>
      <t-content class="content">
        <div class="status-bar">
          <span class="status-label">Task</span>
          <span class="status-chip" :data-status="store.taskState.status">
            {{ store.taskState.status }}
          </span>
          <span class="status-label">Device</span>
          <span class="status-chip" data-status="info">
            {{ store.activeDeviceId || 'none' }}
          </span>
        </div>
        <ScreenCanvas :device-id="store.activeDeviceId" />
      </t-content>
      <t-footer class="input">
        <div class="input-row">
          <t-textarea
            v-model="prompt"
            placeholder="用自然语言描述任务..."
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
          <t-button class="run-btn" theme="primary" @click="startTask">
            开始任务
          </t-button>
        </div>
      </t-footer>
    </t-layout>

    <t-aside class="aside">
      <div class="panel-title">Timeline</div>
      <t-timeline>
        <t-timeline-item
          v-for="(item, i) in timeline"
          :key="i"
          :label="item.type.toUpperCase()"
        >
          {{ item.content }}
        </t-timeline-item>
      </t-timeline>
    </t-aside>
  </t-layout>
</template>

<style scoped>
.app {
  height: 100vh;
  background: #0e1116;
  color: #d7dde8;
}
.sidebar {
  width: 220px;
  background: #151a22;
  border-right: 1px solid #232a35;
  padding: 12px;
}
.aside {
  width: 300px;
  background: #151a22;
  border-left: 1px solid #232a35;
  padding: 12px;
}
.panel-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #c9d2e3;
}
.content {
  padding: 12px;
}
.status-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.status-label {
  color: #8b94a7;
}
.status-chip {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: #1a2230;
  color: #c9d2e3;
  border: 1px solid #2a3240;
}
.status-chip[data-status='running'] {
  color: #00d2a3;
  border-color: #00d2a3;
}
.status-chip[data-status='success'] {
  color: #52c41a;
  border-color: #52c41a;
}
.status-chip[data-status='error'] {
  color: #ff4d4f;
  border-color: #ff4d4f;
}
.status-chip[data-status='info'] {
  color: #8b94a7;
  border-color: #2a3240;
}
.screen-canvas {
  height: calc(100vh - 120px);
  border: 1px dashed #2a3240;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b94a7;
  background: #0b0f14;
}
.input {
  padding: 12px;
  border-top: 1px solid #232a35;
  background: #111720;
}
.input-row {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: end;
}
.run-btn {
  height: 40px;
}
</style>
