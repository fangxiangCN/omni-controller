<template>
  <div class="title-bar">
    <div class="title-bar-content">
      <div class="window-controls">
        <t-button 
          variant="text" 
          shape="square"
          size="small"
          @click="minimizeWindow"
        >
          <t-icon name="minus" />
        </t-button>
        <t-button 
          variant="text" 
          shape="square"
          size="small"
          @click="toggleMaximize"
        >
          <t-icon :name="isMaximized ? 'fullscreen-exit' : 'fullscreen'" />
        </t-button>
        <t-button 
          variant="text" 
          shape="square"
          size="small"
          theme="danger"
          @click="closeWindow"
        >
          <t-icon name="close" />
        </t-button>
      </div>
      
      <div class="app-title">
        <t-icon name="logo" class="app-icon" />
        <span>Omni Controller</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isMaximized = ref(false)

function minimizeWindow() {
  window.api?.minimizeWindow?.()
}

function toggleMaximize() {
  window.api?.toggleMaximizeWindow?.()
}

function closeWindow() {
  window.api?.closeWindow?.()
}

onMounted(() => {
  // 监听窗口状态变化
  window.api?.onWindowStateChange?.((state: { maximized: boolean }) => {
    isMaximized.value = state.maximized
  })
})
</script>

<style scoped>
.title-bar {
  height: 40px;
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-color);
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.title-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.app-icon {
  font-size: 20px;
  color: var(--td-brand-color);
}
</style>
