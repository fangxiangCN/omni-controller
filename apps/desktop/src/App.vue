<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from './stores/app'

const prompt = ref('')
const store = useAppStore()

if (store.devices.length === 0) {
  store.setDevices([
    { id: 'device-1', name: 'Android-001', type: 'android' },
    { id: 'device-2', name: 'HarmonyOS-001', type: 'ohos' },
    { id: 'web-1', name: 'Web-Playwright', type: 'web' },
  ])
}

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
        <div class="screen-canvas">ScreenCanvas</div>
      </t-content>
      <t-footer class="input">
        <t-textarea
          v-model="prompt"
          placeholder="用自然语言描述任务..."
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
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
</style>
