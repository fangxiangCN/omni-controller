<template>
  <div class="playground-view">
    <!-- AI Chat 对话区域 -->
    <div class="chat-container">
      <t-chat
        ref="chatRef"
        :data="chatMessages"
        :loading="isRunning"
        @send="handleSend"
        class="chat-component"
      >
        <template #avatar="{ item }">
          <t-avatar 
            :image="item.avatar" 
            :shape="item.role === 'user' ? 'circle' : 'round'"
          />
        </template>
        
        <template #content="{ item }">
          <div class="message-content">
            <!-- AI 思考中状态 -->
            <div v-if="item.thinking" class="thinking-section">
              <t-loading size="small" text="AI 思考中..." />
              <div v-if="item.thought" class="thought-text">
                {{ item.thought }}
              </div>
            </div>
            
            <!-- 动作列表 -->
            <div v-if="item.actions?.length" class="actions-section">
              <t-space size="small" wrap>
                <t-tag 
                  v-for="(action, index) in item.actions" 
                  :key="index"
                  theme="primary"
                  variant="light"
                  size="small"
                >
                  {{ action }}
                </t-tag>
              </t-space>
            </div>
            
            <!-- 消息内容 -->
            <div class="message-text" v-html="formatContent(item.content)" />
          </div>
        </template>
        
        <template #footer>
          <div class="chat-input-wrapper">
            <t-textarea
              v-model="inputMessage"
              placeholder="输入指令，例如：打开微信并发送消息..."
              :disabled="!isReady || isRunning"
              :maxlength="500"
              :autosize="{ minRows: 2, maxRows: 4 }"
              @enter="handleEnter"
            >
              <template #suffix>
                <t-button 
                  theme="primary" 
                  :loading="isRunning"
                  :disabled="!inputMessage.trim()"
                  @click="handleSend"
                >
                  发送
                </t-button>
              </template>
            </t-textarea>
          </div>
        </template>
      </t-chat>
    </div>

    <!-- 设置按钮 -->
    <t-button
      class="settings-btn"
      theme="default"
      variant="outline"
      shape="circle"
      @click="showSettings = true"
    >
      <t-icon name="setting" /
    </t-button>

    <!-- 设置对话框 -->
    <t-dialog
      v-model:visible="showSettings"
      header="AI 模型配置"
      width="500px"
      :confirm-btn="{ content: '保存', theme: 'primary' }"
      @confirm="handleSaveSettings"
    >
      <t-form :data="modelConfig" label-width="100px">
        <t-form-item label="AI 模型">
          <t-select v-model="modelConfig.type" placeholder="选择模型">
            <t-option 
              v-for="model in availableModels" 
              :key="model.type"
              :value="model.type"
              :label="model.name"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="API Key">
          <t-input 
            v-model="modelConfig.apiKey" 
            type="password"
            placeholder="输入 API Key"
          />
        </t-form-item>

        <t-form-item v-if="selectedModel?.description" label="说明">
          <t-alert :message="selectedModel.description" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgent } from '../composables/useAgent'
import type { ChatMessage, ModelConfigPayload } from '../types'

const {
  isReady,
  isRunning,
  logs,
  currentThought,
  currentActions,
  models,
  initialize,
  startTask
} = useAgent()

const inputMessage = ref('')
const showSettings = ref(false)
const modelConfig = ref<{
  type: string
  apiKey: string
}>({
  type: 'autoglm-phone',
  apiKey: ''
})

const availableModels = computed(() => models.value)

const selectedModel = computed(() =>
  models.value.find(m => m.type === modelConfig.value.type)
)

// 转换日志为 Chat 消息格式
const chatMessages = computed<ChatMessage[]>(() => {
  return logs.value.map(log => ({
    role: log.type === 'user' ? 'user' : 'assistant',
    content: log.content,
    avatar: log.type === 'user' 
      ? 'https://tdesign.gtimg.com/site/avatar.jpg' 
      : 'https://tdesign.gtimg.com/site/chat-avatar.png',
    thinking: log.type === 'planning',
    thought: currentThought.value,
    actions: currentActions.value,
    timestamp: log.timestamp
  }))
})

function formatContent(content: string) {
  // 简单的文本格式化，可以扩展为 Markdown 渲染
  return content.replace(/\n/g, '<br>')
}

function handleSend() {
  const message = inputMessage.value.trim()
  if (!message) return

  startTask(message)
  inputMessage.value = ''
}

function handleEnter(e: KeyboardEvent) {
  // Shift+Enter 换行，Enter 发送
  if (!e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

async function handleSaveSettings() {
  if (!selectedModel.value) return

  const config: ModelConfigPayload = {
    ...selectedModel.value,
    apiKey: modelConfig.value.apiKey
  }

  await initialize(config)
  showSettings.value = false
}
</script>

<style scoped>
.playground-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-container {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.chat-component {
  height: 100%;
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  border: 1px solid var(--td-border-color);
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thinking-section {
  padding: 8px;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.thought-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  font-style: italic;
}

.actions-section {
  padding: 4px 0;
}

.message-text {
  line-height: 1.6;
}

.chat-input-wrapper {
  padding: 16px;
  border-top: 1px solid var(--td-border-color);
  background-color: var(--td-bg-color-container);
}

.settings-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
}
</style>
