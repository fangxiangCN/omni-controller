import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@omni/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@omni/shared/': `${path.resolve(__dirname, '../../packages/shared/src')}/`,
      '@omni/core': path.resolve(__dirname, '../../packages/core/src'),
      '@omni/core/': `${path.resolve(__dirname, '../../packages/core/src')}/`,
      '@': path.resolve(__dirname, '../../packages/core/src'),
      '@/': `${path.resolve(__dirname, '../../packages/core/src')}/`,
      '@omni/drivers-android': path.resolve(__dirname, '../../packages/drivers/android/src'),
      '@omni/drivers-interface': path.resolve(__dirname, '../../packages/drivers/interface/src'),
    },
  },
  plugins: [
    vue(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test'
        // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
        ? undefined
        : {},
    }),
  ],
})
