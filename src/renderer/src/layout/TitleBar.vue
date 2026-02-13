<template>
  <div class="title-bar">
    <div class="app-title">
      <t-icon name="logo" class="app-icon" />
      <span>Omni Controller</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用 Electron 原生窗口按钮，不需要自定义控制
</script>

<style scoped>
.title-bar {
  height: 40px;
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
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
