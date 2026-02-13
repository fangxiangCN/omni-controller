<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from './layout/AppLayout.vue'
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* TDesign 亮色主题变量 */
:root {
  --td-brand-color: #3B82F6;
  --td-brand-color-hover: #2563EB;
  --td-brand-color-active: #1D4ED8;
  --td-brand-color-focus: #3B82F6;
  
  --td-bg-color-page: #FFFFFF;
  --td-bg-color-container: #FFFFFF;
  --td-bg-color-container-hover: #F8FAFC;
  --td-bg-color-container-active: #F1F5F9;
  --td-bg-color-secondarycontainer: #F8FAFC;
  
  --td-text-color-primary: #1E293B;
  --td-text-color-secondary: #64748B;
  --td-text-color-placeholder: #94A3B8;
  --td-text-color-disabled: #CBD5E1;
  
  --td-border-color: rgba(0, 0, 0, 0.1);
  --td-border-color-hover: rgba(0, 0, 0, 0.2);
  
  --td-success-color: #10B981;
  --td-warning-color: #F59E0B;
  --td-error-color: #EF4444;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
