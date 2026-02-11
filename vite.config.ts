import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

// 共享的路径别名配置
const sharedAliases = {
  '@': resolve(__dirname, 'src'),
  '@main': resolve(__dirname, 'src/main'),
  '@renderer': resolve(__dirname, 'src/renderer'),
  '@types': resolve(__dirname, 'src/types'),
  '@shared': resolve(__dirname, 'src/shared-runtime'),
};

// Node.js 原生模块和外部依赖
const externalModules = [
  'electron',
  '@devicefarmer/adbkit',
  '@silvia-odwyer/photon',
  '@silvia-odwyer/photon-node',
  'sharp',
  'get-port',
  'debug',
  'fs',
  'path',
  'os',
  'crypto',
  'stream',
  'events',
  'util',
  'http',
  'https',
  'net',
  'child_process',
  'url',
  'node:fs',
  'node:path',
  'node:os',
  'node:crypto',
  'node:stream',
  'node:events',
  'node:util',
  'node:http',
  'node:https',
  'node:net',
  'node:child_process',
  'node:url',
];

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart: (options) => options.startup(),
        vite: {
          resolve: {
            alias: sharedAliases,
          },
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: externalModules,
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart: (options) => options.reload(),
        vite: {
          resolve: {
            alias: sharedAliases,
          },
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: externalModules,
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: sharedAliases,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
