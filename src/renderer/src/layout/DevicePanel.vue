<template>
  <div class="device-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <t-button 
        variant="text" 
        shape="square"
        @click="$emit('toggle')"
      >
        <t-icon :name="collapsed ? 'chevron-right' : 'chevron-left'" />
      </t-button>
      
      <span v-if="!collapsed" class="panel-title">设备列表</span>
      
      <t-button 
        v-if="!collapsed"
        variant="text" 
        shape="square"
        size="small"
        @click="refreshDevices"
      >
        <t-icon name="refresh" />
      </t-button>
    </div>

    <!-- 设备列表 -->
    <div class="device-list-container">
      <t-empty
        v-if="devices.length === 0"
        description="暂无设备"
        size="small"
      />
      
      <t-list v-else size="small" split>
        <t-list-item
          v-for="device in devices"
          :key="device.id"
          :class="['device-item', { active: device.id === activeDeviceId }]"
          @click="selectDevice(device.id)"
        >
          <t-list-item-meta
            :title="collapsed ? '' : device.name"
            :description="collapsed ? '' : device.osVersion"
          >
            <template #avatar>
              <t-avatar 
                shape="circle" 
                :style="{ backgroundColor: getDeviceColor(device.type) }"
              >
                <t-icon :name="getDeviceIcon(device.type)" />
              </t-avatar>
            </template>
          </t-list-item-meta>

          <template #action>
            <t-tag 
              v-if="!collapsed"
              :theme="getStatusTheme(device.status)" 
              variant="light"
              size="small"
            >
              {{ getStatusText(device.status) }}
            </t-tag>
          </template>
        </t-list-item>
      </t-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '../composables/useDevice'
import type { DeviceType, DeviceStatus } from '../types'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const { devices, activeDeviceId, refreshDevices, selectDevice } = useDevice()

function getDeviceIcon(type: DeviceType) {
  const icons: Record<DeviceType, string> = {
    android: 'logo-android',
    ios: 'logo-apple',
    web: 'internet',
    ohos: 'logo-huawei'
  }
  return icons[type] || 'device'
}

function getDeviceColor(type: DeviceType) {
  const colors: Record<DeviceType, string> = {
    android: '#10B981',
    ios: '#3B82F6',
    web: '#F59E0B',
    ohos: '#000000'
  }
  return colors[type] || '#6B7280'
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
.device-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--td-bg-color-container);
}

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--td-border-color);
  gap: 8px;
}

.panel-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.device-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.device-item {
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.device-item:hover {
  background-color: var(--td-bg-color-container-hover);
}

.device-item.active {
  background-color: rgba(59, 130, 246, 0.15);
}
</style>
