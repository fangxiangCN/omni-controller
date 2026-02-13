<template>
  <div class="main-workspace">
    <t-tabs v-model="currentView" class="workspace-tabs">
      <t-tab-panel value="playground" label="AI 控制台">
        <PlaygroundView />
      </t-tab-panel>
      
      <t-tab-panel value="report" label="报告">
        <ReportView />
      </t-tab-panel>
      
      <t-tab-panel value="recorder" label="录制">
        <RecorderView />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PlaygroundView from '../views/PlaygroundView.vue'
import ReportView from '../views/ReportView.vue'
import RecorderView from '../views/RecorderView.vue'

const currentView = ref('playground')
</script>

<style scoped>
.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--td-bg-color-page);
}

.workspace-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.workspace-tabs :deep(.t-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.workspace-tabs :deep(.t-tab-panel) {
  height: 100%;
  overflow: hidden;
}
</style>
