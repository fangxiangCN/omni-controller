import { defineConfig } from 'vite'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'

const corePkgPath = path.resolve(__dirname, '../../packages/core/package.json')
const corePkg = JSON.parse(readFileSync(corePkgPath, 'utf-8'))
const define = {
  __VERSION__: JSON.stringify(corePkg.version ?? '0.0.0'),
}

const alias = {
  '@omni/shared': path.resolve(__dirname, '../../packages/shared/src'),
  '@omni/shared/': `${path.resolve(__dirname, '../../packages/shared/src')}/`,
  '@omni/core': path.resolve(__dirname, '../../packages/core/src'),
  '@omni/core/': `${path.resolve(__dirname, '../../packages/core/src')}/`,
  '@omni/visualizer': path.resolve(
    __dirname,
    '../../packages/visualizer/src',
  ),
  '@omni/visualizer/': `${path.resolve(
    __dirname,
    '../../packages/visualizer/src',
  )}/`,
  '@omni/playground': path.resolve(
    __dirname,
    '../../packages/playground/src',
  ),
  '@omni/playground/': `${path.resolve(
    __dirname,
    '../../packages/playground/src',
  )}/`,
  '@omni/web': path.resolve(__dirname, '../../packages/web/src'),
  '@omni/web/': `${path.resolve(__dirname, '../../packages/web/src')}/`,
}

const require = createRequire(import.meta.url)
const electronModule = require('vite-plugin-electron/simple')
const electron = (electronModule as any).default ?? electronModule

export default defineConfig({
  define,
  resolve: { alias },
  server: {
    host: '127.0.0.1',
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          resolve: { alias },
          define,
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          resolve: { alias },
          define,
        },
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
})
