<template>
  <t-config-provider :global-config="globalConfig">
    <t-layout class="app-layout">
      <TitleBar />
      
      <t-layout class="app-body">
        <!-- 左侧设备面板 -->
        <t-aside 
          :width="collapsed ? '64px' : '280px'"
          class="device-panel-aside"
        >
          <DevicePanel
            :collapsed="collapsed"
            @toggle="collapsed = !collapsed"
          />
        </t-aside>

        <!-- 主内容区 -->
        <t-content class="main-content">
          <MainWorkspace />
          <StatusBar />
        </t-content>

        <!-- 右侧检查器面板 -->
        <t-aside 
          width="320px"
          class="inspector-panel-aside"
        >
          <InspectorPanel />
        </t-aside>
      </t-layout>
    </t-layout>
  </t-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TitleBar from './TitleBar.vue'
import DevicePanel from './DevicePanel.vue'
import MainWorkspace from './MainWorkspace.vue'
import InspectorPanel from './InspectorPanel.vue'
import StatusBar from './StatusBar.vue'

const collapsed = ref(false)

// TDesign 全局配置
const globalConfig = {
  // 可以在这里配置全局主题、语言等
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--td-bg-color-page);
}

.app-body {
  flex: 1;
  overflow: hidden;
  background-color: var(--td-bg-color-page);
}

.device-panel-aside {
  background-color: var(--td-bg-color-container);
  border-right: 1px solid var(--td-border-color);
  overflow: hidden;
  transition: width 0.3s ease;
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--td-bg-color-page);
}

.inspector-panel-aside {
  background-color: var(--td-bg-color-container);
  border-left: 1px solid var(--td-border-color);
  overflow: hidden;
}
</style>
