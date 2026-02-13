<template>
  <div class="inspector-panel">
    <div class="panel-header">
      <span class="panel-title">设备信息</span>
    </div>
    
    <div class="panel-content">
      <t-empty
        v-if="!activeDevice"
        description="请选择设备"
        size="small"
      />
      
      <t-descriptions v-else layout="vertical" :column="1">
        <t-descriptions-item label="设备名称">
          {{ activeDevice.name }}
        </t-descriptions-item>
        
        <t-descriptions-item label="设备类型">
          <t-tag :theme="getDeviceTheme(activeDevice.type)" variant="light">
            {{ activeDevice.type.toUpperCase() }}
          </t-tag>
        </t-descriptions-item>
        
        <t-descriptions-item label="连接状态">
          <t-tag :theme="getStatusTheme(activeDevice.status)" variant="light">
            {{ getStatusText(activeDevice.status) }}
          </t-tag>
        </t-descriptions-item>
        
        <t-descriptions-item label="分辨率">
          {{ activeDevice.resolution || '未知' }}
        </t-descriptions-item>
        
        <t-descriptions-item label="系统版本">
          {{ activeDevice.osVersion || '未知' }}
        </t-descriptions-item>
      </t-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceStore } from '../stores/device'
import type { DeviceType, DeviceStatus } from '../types'

const deviceStore = useDeviceStore()
const activeDevice = computed(() => deviceStore.activeDevice)

function getDeviceTheme(type: DeviceType) {
  const themes: Record<DeviceType, string> = {
    android: 'success',
    ios: 'primary',
    web: 'warning',
    ohos: 'default'
  }
  return themes[type]
}

function getStatusTheme(status: DeviceStatus) {
  const themes: Record<DeviceStatus, string> = {
    connected: 'success',
    disconnected: 'default',
    busy: 'warning'
  }
  return themes[status]
}

function getStatusText(status: DeviceStatus) {
  const texts: Record<DeviceStatus, string> = {
    connected: '已连接',
    disconnected: '未连接',
    busy: '忙碌'
  }
  return texts[status]
}
</script>

<style scoped>
.inspector-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--td-bg-color-container);
}

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--td-border-color);
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
</style>
