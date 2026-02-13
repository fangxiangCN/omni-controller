declare module 'vue' {
  export function createApp(rootComponent: any): any
  export function ref<T>(value: T): { value: T }
  export function computed<T>(getter: () => T): { value: T }
  export function onMounted(callback: () => void): void
  export function onUnmounted(callback: () => void): void
  export function defineComponent(options: any): any
}

declare module 'pinia' {
  export function createPinia(): any
  export function defineStore(id: string, setup: () => any): () => any
}

declare module 'tdesign-vue-next' {
  const TDesign: any
  export default TDesign
}

declare module '@tdesign-vue-next/chat' {
  const TDesignChat: any
  export default TDesignChat
}
