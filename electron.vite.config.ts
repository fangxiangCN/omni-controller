import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@preload': resolve(__dirname, 'src/preload')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload'),
        '@main': resolve(__dirname, 'src/main')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@main': resolve(__dirname, 'src/main')
      }
    },
    plugins: [
      vue()
    ],
    server: {
      fs: {
        allow: [
          resolve(__dirname, 'src/renderer'),
          resolve(__dirname, 'node_modules')
        ]
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    }
  }
})
