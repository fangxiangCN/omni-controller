<template>
  <div class="report-view">
    <t-empty
      title="报告列表"
      description="暂无报告数据"
    >
      <template #image">
        <t-icon name="file" size="64px" />
      </template>
    </t-empty>
  </div>
</template>

<script setup lang="ts">
// 报告视图 - 待实现
</script>

<style scoped>
.report-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
