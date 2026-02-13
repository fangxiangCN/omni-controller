# TDesign Vue Next 迁移规划报告

## 📊 当前项目状态分析

### 技术栈对比

| 项目 | 当前 | 目标 |
|-----|------|------|
| **框架** | React 18 | Vue 3 |
| **UI 组件库** | Ant Design 5.x | TDesign Vue Next + Chat |
| **构建工具** | Vite 6 + electron-vite | Vite + electron-vite |
| **状态管理** | React Context/Hooks | Vue Composition API + Pinia |
| **语言** | TypeScript 5.x | TypeScript 5.x |
| **样式方案** | CSS + Ant Design 主题 | TDesign 主题 + CSS Variables |

### 现有组件清单

**Ant Design 组件使用情况：**
- Layout, ConfigProvider (布局)
- Card, Empty, Typography, Tag, Button, Space (基础组件)
- Input, Modal, Form, Select (表单)
- List, Badge, Tooltip (数据展示)
- Tabs (导航)
- Timeline (时间线)
- Alert, Descriptions, Divider (其他)

**自定义组件：**
- TitleBar (标题栏)
- DevicePanel (设备面板)
- MainWorkspace (主工作区)
- InspectorPanel (检查器面板)
- StatusBar (状态栏)
- PlaygroundView (AI 控制台)

### TDesign Vue Next 组件映射

| Ant Design | TDesign Vue Next | 说明 |
|-----------|------------------|------|
| Layout | Layout | ✅ 完全对应 |
| ConfigProvider | ConfigProvider | ✅ 完全对应 |
| Card | Card | ✅ 完全对应 |
| Empty | Empty | ✅ 完全对应 |
| Typography | Typography | ✅ 完全对应 |
| Tag | Tag | ✅ 完全对应 |
| Button | Button | ✅ 完全对应 |
| Space | Space | ✅ 完全对应 |
| Input | Input | ✅ 完全对应 |
| Modal | Dialog | ⚠️ API 略有不同 |
| Form | Form | ✅ 完全对应 |
| Select | Select | ✅ 完全对应 |
| List | List | ✅ 完全对应 |
| Badge | Badge | ✅ 完全对应 |
| Tooltip | Tooltip | ✅ 完全对应 |
| Tabs | Tabs | ✅ 完全对应 |
| Timeline | Timeline | ✅ 完全对应 |
| Alert | Alert | ✅ 完全对应 |
| Descriptions | Descriptions | ✅ 完全对应 |
| Divider | Divider | ✅ 完全对应 |

**AI Chat 组件：**
- TDesign Chat (专门用于 AI 对话)
- ChatItem (单个对话项)
- ChatInput (输入框)
- ChatContent (内容展示)
- ChatAction (操作按钮)

## 🎯 迁移策略

### 阶段一：环境准备（1-2 天）

#### 1.1 更新 package.json
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "tdesign-vue-next": "^1.9.0",
    "@tdesign-vue-next/chat": "^0.4.0",
    "pinia": "^2.1.0",
    "@vitejs/plugin-vue": "^5.0.0"
  },
  "devDependencies": {
    "@tdesign-vue-next/auto-import-resolver": "^0.0.0",
    "unplugin-vue-components": "^0.26.0",
    "unplugin-auto-import": "^0.17.0"
  }
}
```

#### 1.2 更新 Vite 配置
```typescript
// electron.vite.config.ts
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { TDesignResolver } from 'tdesign-vue-next/es/resolvers'

export default defineConfig({
  main: {
    // 主进程配置
  },
  preload: {
    // 预加载配置
  },
  renderer: {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [TDesignResolver()],
      }),
      Components({
        resolvers: [TDesignResolver()],
      }),
    ],
  },
})
```

#### 1.3 创建 Vue 入口文件
```typescript
// src/renderer/src/main.ts
import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'
import TDesignChat from '@tdesign-vue-next/chat'
import 'tdesign-vue-next/es/style/index.css'

import App from './App.vue'

const app = createApp(App)
app.use(TDesign)
app.use(TDesignChat)
app.mount('#app')
```

### 阶段二：核心架构迁移（3-4 天）

#### 2.1 类型定义迁移
- 将 React 类型转换为 Vue 类型
- 保持 IPC 类型不变（因为主进程不受影响）

```typescript
// 从
interface Device {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
}

// 到
interface Device {
  id: string
  name: string
  status: 'connected' | 'disconnected'
}
```

#### 2.2 状态管理迁移
使用 Pinia 替代 React Context：

```typescript
// stores/device.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Device } from '../types'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const activeDeviceId = ref<string | null>(null)
  
  const activeDevice = computed(() => 
    devices.value.find(d => d.id === activeDeviceId.value)
  )
  
  function setDevices(newDevices: Device[]) {
    devices.value = newDevices
  }
  
  function selectDevice(id: string) {
    activeDeviceId.value = id
  }
  
  return {
    devices,
    activeDeviceId,
    activeDevice,
    setDevices,
    selectDevice
  }
})
```

#### 2.3 IPC 客户端迁移
```typescript
// composables/useIpc.ts
import { onMounted, onUnmounted } from 'vue'

export function useIpc() {
  const ipcRenderer = window.api?.ipcRenderer
  
  function on(channel: string, handler: (...args: any[]) => void) {
    const cleanup = ipcRenderer?.on(channel, handler)
    onUnmounted(() => cleanup?.())
  }
  
  function send(channel: string, ...args: any[]) {
    ipcRenderer?.send(channel, ...args)
  }
  
  function invoke(channel: string, ...args: any[]) {
    return ipcRenderer?.invoke(channel, ...args)
  }
  
  return { on, send, invoke }
}
```

### 阶段三：组件迁移（5-7 天）

#### 3.1 AppLayout 重构
```vue
<!-- AppLayout.vue -->
<template>
  <t-config-provider :global-config="themeConfig">
    <t-layout class="app-layout">
      <title-bar />
      <t-layout>
        <!-- 左侧设备面板 -->
        <t-aside :width="collapsed ? '64px' : '280px'">
          <device-panel 
            :collapsed="collapsed"
            @toggle="collapsed = !collapsed"
          />
        </t-aside>
        
        <!-- 主内容区 -->
        <t-content>
          <main-workspace />
          <status-bar />
        </t-content>
        
        <!-- 右侧检查器 -->
        <t-aside width="320px">
          <inspector-panel />
        </t-aside>
      </t-layout>
    </t-layout>
  </t-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { themeConfig } from '../theme'
import TitleBar from './TitleBar.vue'
import DevicePanel from './DevicePanel.vue'
import MainWorkspace from './MainWorkspace.vue'
import InspectorPanel from './InspectorPanel.vue'
import StatusBar from './StatusBar.vue'

const collapsed = ref(false)
</script>
```

#### 3.2 DevicePanel 重构
```vue
<!-- DevicePanel.vue -->
<template>
  <div class="device-panel">
    <div class="panel-header">
      <t-button variant="text" @click="$emit('toggle')">
        <template #icon>
          <t-icon :name="collapsed ? 'chevron-right' : 'chevron-left'" />
        </template>
      </t-button>
      <span v-if="!collapsed" class="panel-title">设备列表</span>
    </div>
    
    <t-list class="device-list" size="small">
      <t-list-item
        v-for="device in deviceStore.devices"
        :key="device.id"
        :class="{ active: device.id === deviceStore.activeDeviceId }"
        @click="selectDevice(device.id)"
      >
        <t-list-item-meta
          :title="device.name"
          :description="device.osVersion"
        >
          <template #avatar>
            <t-avatar shape="circle" :style="getDeviceStyle(device.type)">
              <t-icon :name="getDeviceIcon(device.type)" />
            </t-avatar>
          </template>
        </t-list-item-meta>
        <template #action>
          <t-tag :theme="getStatusTheme(device.status)" variant="light">
            {{ device.status }}
          </t-tag>
        </template>
      </t-list-item>
    </t-list>
  </div>
</template>

<script setup lang="ts">
import { useDeviceStore } from '../stores/device'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const deviceStore = useDeviceStore()

function selectDevice(id: string) {
  deviceStore.selectDevice(id)
}

function getDeviceIcon(type: string) {
  const icons: Record<string, string> = {
    android: 'logo-android',
    ios: 'logo-apple',
    web: 'internet'
  }
  return icons[type] || 'device'
}

function getStatusTheme(status: string) {
  const themes: Record<string, string> = {
    connected: 'success',
    disconnected: 'default',
    busy: 'warning'
  }
  return themes[status] || 'default'
}
</script>
```

#### 3.3 PlaygroundView 使用 AI Chat 组件
```vue
<!-- PlaygroundView.vue -->
<template>
  <div class="playground-view">
    <!-- AI Chat 对话区域 -->
    <t-chat
      ref="chatRef"
      :data="messages"
      :loading="isRunning"
      @send="handleSend"
    >
      <template #avatar="{ item }">
        <t-avatar 
          :image="item.avatar" 
          :shape="item.role === 'user' ? 'circle' : 'round'"
        />
      </template>
      
      <template #content="{ item }">
        <div class="message-content">
          <div v-if="item.role === 'assistant' && item.thinking" class="thinking">
            <t-loading size="small" text="AI 思考中..." />
            <div class="thought">{{ item.thought }}</div>
          </div>
          <div class="actions" v-if="item.actions?.length">
            <t-tag 
              v-for="action in item.actions" 
              :key="action"
              theme="primary"
              variant="light"
            >
              {{ action }}
            </t-tag>
          </div>
          <div class="text" v-html="renderMarkdown(item.content)" />
        </div>
      </template>
      
      <template #footer>
        <t-chat-input
          v-model="inputMessage"
          placeholder="输入指令，例如：打开微信并发送消息..."
          :disabled="!isReady || isRunning"
          @send="handleSend"
        >
          <template #suffix>
            <t-button 
              theme="primary" 
              :loading="isRunning"
              @click="handleSend"
            >
              发送
            </t-button>
          </template>
        </t-chat-input>
      </template>
    </t-chat>
    
    <!-- 设置弹窗 -->
    <t-dialog
      v-model:visible="showSettings"
      header="AI 模型配置"
      width="500px"
    >
      <t-form :data="modelConfig">
        <t-form-item label="AI 模型">
          <t-select v-model="modelConfig.type">
            <t-option 
              v-for="model in availableModels" 
              :key="model.type"
              :value="model.type"
              :label="model.name"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="API Key">
          <t-input v-model="modelConfig.apiKey" type="password" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgentStore } from '../stores/agent'
import type { ChatMessage } from '../types'

const agentStore = useAgentStore()
const chatRef = ref()
const inputMessage = ref('')
const showSettings = ref(false)

const messages = computed<ChatMessage[]>(() => 
  agentStore.logs.map(log => ({
    role: log.type === 'user' ? 'user' : 'assistant',
    content: log.content,
    avatar: log.type === 'user' ? '/user-avatar.png' : '/ai-avatar.png',
    thinking: log.type === 'planning',
    thought: log.thought,
    actions: log.actions
  }))
)

function handleSend() {
  if (!inputMessage.value.trim()) return
  agentStore.sendTask(inputMessage.value)
  inputMessage.value = ''
}

function renderMarkdown(content: string) {
  // 使用 marked 或其他 markdown 解析器
  return content
}
</script>
```

### 阶段四：样式和主题定制（2-3 天）

#### 4.1 创建 TDesign 主题配置
```typescript
// src/renderer/src/theme/index.ts
export const tdesignTheme = {
  token: {
    // 主色调 - 深色主题
    brandColor: '#3B82F6',
    brandColorHover: '#2563EB',
    brandColorActive: '#1D4ED8',
    brandColorFocus: '#3B82F6',
    
    // 背景色
    bgColorPage: '#0F172A',
    bgColorContainer: '#1E293B',
    bgColorContainerHover: '#334155',
    bgColorContainerActive: '#475569',
    bgColorSecondaryContainer: '#1A202C',
    
    // 文字色
    textColorPrimary: '#F1F5F9',
    textColorSecondary: '#94A3B8',
    textColorPlaceholder: '#64748B',
    textColorDisabled: '#475569',
    
    // 边框
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderColorHover: 'rgba(255, 255, 255, 0.2)',
    
    // 功能色
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
  }
}
```

#### 4.2 全局样式覆盖
```scss
// src/renderer/src/styles/global.scss
:root {
  // TDesign 变量覆盖
  --td-brand-color: #3B82F6;
  --td-brand-color-hover: #2563EB;
  --td-brand-color-active: #1D4ED8;
  
  --td-bg-color-page: #0F172A;
  --td-bg-color-container: #1E293B;
  --td-bg-color-secondarycontainer: #1A202C;
  
  --td-text-color-primary: #F1F5F9;
  --td-text-color-secondary: #94A3B8;
  
  --td-border-color: rgba(255, 255, 255, 0.1);
  
  // 自定义变量
  --color-android: #10B981;
  --color-ios: #3B82F6;
  --color-web: #F59E0B;
}

// 暗色主题适配
.tdesign-vue-next {
  background-color: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
}
```

### 阶段五：测试和优化（2-3 天）

#### 5.1 功能测试清单
- [ ] 设备列表显示和切换
- [ ] AI Agent 对话功能
- [ ] 设置对话框
- [ ] 状态栏信息更新
- [ ] 主题和样式一致性
- [ ] IPC 通信正常
- [ ] ADB 设备连接

#### 5.2 性能优化
- 使用 Vue 的 `v-memo` 和 `shallowRef` 优化大数据列表
- 使用 `defineAsyncComponent` 实现组件懒加载
- 配置 Vite 的 `rollup` 分包策略

## 📁 目录结构调整

```
src/renderer/
├── src/
│   ├── main.ts                 # Vue 入口
│   ├── App.vue                 # 根组件
│   ├── api/                    # API 接口
│   │   ├── ipc.ts
│   │   └── mock.ts
│   ├── assets/                 # 静态资源
│   ├── components/             # 公共组件
│   ├── composables/            # Vue 组合式函数
│   │   ├── useIpc.ts
│   │   ├── useDevice.ts
│   │   └── useAgent.ts
│   ├── stores/                 # Pinia 状态管理
│   │   ├── device.ts
│   │   ├── agent.ts
│   │   └── app.ts
│   ├── theme/                  # 主题配置
│   │   └── index.ts
│   ├── styles/                 # 全局样式
│   │   └── global.scss
│   ├── types/                  # 类型定义
│   ├── views/                  # 页面视图
│   │   ├── PlaygroundView.vue
│   │   ├── ReportView.vue
│   │   └── RecorderView.vue
│   └── layout/                 # 布局组件
│       ├── AppLayout.vue
│       ├── TitleBar.vue
│       ├── DevicePanel.vue
│       ├── MainWorkspace.vue
│       ├── InspectorPanel.vue
│       └── StatusBar.vue
├── index.html
└── env.d.ts
```

## ⏱️ 时间规划

| 阶段 | 预计时间 | 任务 |
|-----|---------|------|
| 阶段一 | 1-2 天 | 环境配置、依赖安装、基础架构 |
| 阶段二 | 3-4 天 | 状态管理、IPC 封装、类型定义 |
| 阶段三 | 5-7 天 | 组件重构、AI Chat 集成 |
| 阶段四 | 2-3 天 | 主题定制、样式优化 |
| 阶段五 | 2-3 天 | 测试、Bug 修复、性能优化 |
| **总计** | **13-19 天** | 完整迁移 |

## ⚠️ 风险和注意事项

### 1. IPC 通信差异
- React 和 Vue 的生命周期不同，需要重新设计 IPC 监听和清理逻辑
- Vue 的 `onUnmounted` 需要正确清理事件监听

### 2. 状态管理迁移
- React 的 Context/Hooks → Vue 的 Pinia
- 注意响应式数据的差异（`ref`/`reactive` vs `useState`）

### 3. AI Chat 组件限制
- TDesign Chat 是 Vue 专用组件，无法与 React 混用
- 需要完整迁移到 Vue 才能使用

### 4. 样式兼容性
- TDesign 和 Ant Design 的类名和 CSS 变量不同
- 需要全面检查和调整自定义样式

### 5. 构建配置
- electron-vite 对 Vue 的支持需要额外配置
- 需要测试生产构建是否正常

## ✅ 迁移检查清单

### 准备工作
- [ ] 创建 feature/tdesign-vue-migration 分支
- [ ] 备份当前代码
- [ ] 安装 Vue 3 + TDesign 依赖
- [ ] 配置 Vite Vue 插件

### 核心功能
- [ ] 设备列表显示
- [ ] 设备选择和切换
- [ ] AI Agent 对话
- [ ] 模型配置
- [ ] 状态栏信息
- [ ] 设置对话框

### 样式和主题
- [ ] 暗色主题配置
- [ ] 组件样式统一
- [ ] 响应式布局
- [ ] 自定义 CSS 变量

### 测试
- [ ] 开发环境运行
- [ ] 生产构建测试
- [ ] IPC 通信测试
- [ ] ADB 设备连接测试
- [ ] AI 对话功能测试

## 🚀 下一步行动

1. **确认迁移计划**：你是否同意这个迁移方案？
2. **开始实施**：我可以立即开始第一阶段的环境配置
3. **并行开发**：如果需要，可以分模块逐步迁移

请告诉我你的决定，我可以立即开始迁移工作！
