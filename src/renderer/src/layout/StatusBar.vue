<template>
  <div class="status-bar">
    <div class="status-left">
      <t-space size="small">
        <span class="status-text">
          设备: {{ deviceCount }} 个
        </span>
        <span v-if="activeDevice" class="status-text">
          | 当前: {{ activeDevice.name }}
        </span>
      </t-space>
    </div>
    
    <div class="status-right">
      <t-space size="small">
        <t-badge 
          :theme="isReady ? 'success' : 'default'" 
          dot
        >
          <span class="status-text">
            {{ isReady ? 'AI 已就绪' : 'AI 未配置' }}
          </span>
        </t-badge>
      </t-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceStore } from '../stores/device'
import { useAgentStore } from '../stores/agent'

const deviceStore = useDeviceStore()
const agentStore = useAgentStore()

const deviceCount = computed(() => deviceStore.devices.length)
const activeDevice = computed(() => deviceStore.activeDevice)
const isReady = computed(() => agentStore.isReady)
</script>

<style scoped>
.status-bar {
  height: 32px;
  background-color: var(--td-bg-color-container);
  border-top: 1px solid var(--td-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}
</style>
