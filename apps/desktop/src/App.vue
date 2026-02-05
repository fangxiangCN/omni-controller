<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from './stores/app'
import ScreenCanvas from './components/ScreenCanvas.vue'

const prompt = ref('')
const logFilter = ref<'all' | 'thought' | 'plan' | 'action' | 'info' | 'error'>('all')
const store = useAppStore()

onMounted(() => {
  store.initIpc()
})

const menuValue = computed(() => store.activeDeviceId || store.devices[0]?.id || '')
const activeDevice = computed(() => store.devices.find((d) => d.id === store.activeDeviceId))
const deviceStatus = computed(() => store.getDeviceStatus(store.activeDeviceId))
const deviceStatusLabel = computed(() =>
  deviceStatus.value === 'streaming' ? '在线' : '无画面',
)
const canStart = computed(() => !!store.activeDeviceId && !!prompt.value.trim())
const canRetry = computed(() => ['success', 'error'].includes(store.taskState.status))
const lastError = computed(() => store.lastError)
const taskStatusLabel = computed(() => {
  if (store.taskState.status === 'idle') return '空闲'
  if (store.taskState.status === 'running') return '执行中'
  if (store.taskState.status === 'success') return '完成'
  if (store.taskState.status === 'error') return '失败'
  return store.taskState.status
})

const timeline = computed(() => {
  const logs = store.logs.length
    ? store.logs
    : [
        { type: 'thought', content: '等待任务输入' },
        { type: 'plan', content: '选择设备并填写目标' },
        { type: 'action', content: '点击开始任务' },
      ]
  if (logFilter.value === 'all') return logs
  return logs.filter((l) => l.type === logFilter.value)
})

function startTask() {
  if (!prompt.value.trim()) return
  store.startTask(prompt.value.trim())
}

function retryTask() {
  if (!store.lastInstruction) return
  store.startTask(store.lastInstruction)
}

function stopTask() {
  store.stopTask()
}
</script>

<template>
  <t-layout class="app">
    <t-aside class="sidebar">
      <div class="panel-title">设备列表</div>
      <t-menu
        theme="dark"
        :value="menuValue"
        @change="(v: string | number) => store.setActiveDevice(String(v))"
      >
        <t-menu-item v-for="d in store.devices" :key="d.id" :value="d.id">
          {{ d.name }} <span class="device-type">({{ d.type }})</span>
        </t-menu-item>
      </t-menu>
    </t-aside>

    <t-layout>
      <t-content class="content">
        <div class="status-bar">
          <span class="status-label">任务状态</span>
          <span class="status-chip" :data-status="store.taskState.status">
            {{ taskStatusLabel }}
          </span>
          <span class="status-label">设备</span>
          <span class="status-chip" data-status="info">
            {{ activeDevice?.name || store.activeDeviceId || '未选择' }}
          </span>
          <span class="status-label">流状态</span>
          <span class="status-chip" :data-status="deviceStatus">
            {{ deviceStatusLabel }}
          </span>
        </div>
        <div v-if="lastError" class="status-alert" data-status="error">
          <span>最近错误：</span>
          <span class="status-alert__text">{{ lastError }}</span>
          <t-button size="small" theme="default" @click="store.clearLogs()">清空</t-button>
        </div>
        <ScreenCanvas :device-id="store.activeDeviceId" />
      </t-content>
      <t-footer class="input">
        <div class="input-row">
          <t-textarea
            v-model="prompt"
            placeholder="用自然语言描述任务..."
            :autosize="{ minRows: 2, maxRows: 4 }"
            @keydown.enter.exact.prevent="startTask"
          />
          <div class="input-actions">
            <t-button class="run-btn" theme="primary" :disabled="!canStart" @click="startTask">
              开始任务
            </t-button>
            <t-button class="run-btn" theme="default" :disabled="!canRetry" @click="retryTask">
              重试
            </t-button>
            <t-button class="run-btn" theme="danger" @click="stopTask">
              停止
            </t-button>
          </div>
        </div>
      </t-footer>
    </t-layout>

    <t-aside class="aside">
      <div class="panel-title">执行时间线</div>
      <div class="timeline-toolbar">
        <t-select v-model="logFilter" size="small" class="filter-select">
          <t-option value="all" label="全部" />
          <t-option value="thought" label="thought" />
          <t-option value="plan" label="plan" />
          <t-option value="action" label="action" />
          <t-option value="info" label="info" />
          <t-option value="error" label="error" />
        </t-select>
        <t-button size="small" theme="default" @click="store.clearLogs()">清空</t-button>
      </div>
      <t-timeline>
        <t-timeline-item v-for="(item, i) in timeline" :key="i" :label="item.type.toUpperCase()">
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
.device-type {
  color: #7b879c;
  font-size: 12px;
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
.status-chip[data-status='streaming'] {
  color: #52c41a;
  border-color: #2a3240;
}
.status-chip[data-status='idle'] {
  color: #8b94a7;
  border-color: #2a3240;
}
.input {
  padding: 12px;
  border-top: 1px solid #232a35;
  background: #111720;
}
.input-row {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 12px;
  align-items: end;
}
.input-actions {
  display: grid;
  gap: 8px;
}
.run-btn {
  height: 36px;
}
.timeline-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.filter-select {
  width: 120px;
}
.status-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: #1b1214;
  border: 1px solid #4a1f23;
  color: #ffb2b6;
}
.status-alert__text {
  flex: 1;
  color: #ffd1d4;
}
</style>
