import { defineConfig, type Plugin } from 'vite'
import path from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'

const corePkgPath = path.resolve(__dirname, '../../packages/core/package.json')
const corePkg = JSON.parse(readFileSync(corePkgPath, 'utf-8'))
const define = {
  __VERSION__: JSON.stringify(corePkg.version ?? '0.0.0'),
}

// 基础 alias（静态映射）
const alias = {
  '@omni/shared': path.resolve(__dirname, '../../packages/shared/src'),
  '@omni/shared/': `${path.resolve(__dirname, '../../packages/shared/src')}/`,
  '@omni/core': path.resolve(__dirname, '../../packages/core/src'),
  '@omni/core/': `${path.resolve(__dirname, '../../packages/core/src')}/`,
  '@omni/drivers-android': path.resolve(
    __dirname,
    '../../packages/drivers/android/src',
  ),
  '@omni/drivers-android/': `${path.resolve(
    __dirname,
    '../../packages/drivers/android/src',
  )}/`,
  '@omni/drivers-interface': path.resolve(
    __dirname,
    '../../packages/drivers/interface/src',
  ),
  '@omni/drivers-interface/': `${path.resolve(
    __dirname,
    '../../packages/drivers/interface/src',
  )}/`,
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
  // 默认 @/ 映射到 core，但会在插件中根据来源覆盖
  '@/': path.resolve(__dirname, '../../packages/core/src/'),
}

// 辅助函数：尝试解析文件路径
function resolveFilePath(basePath: string, importPath: string): string | null {
  // 尝试添加扩展名
  const extensions = ['.ts', '.tsx', '.js', '.jsx']
  
  for (const ext of extensions) {
    const fullPath = basePath + ext
    try {
      const stats = statSync(fullPath)
      if (stats.isFile()) {
        return fullPath
      }
    } catch {
      // 文件不存在，继续尝试下一个扩展名
    }
  }
  
  // 尝试作为目录解析（index.ts）
  try {
    const stats = statSync(basePath)
    if (stats.isDirectory()) {
      const indexPath = path.join(basePath, 'index.ts')
      try {
        const indexStats = statSync(indexPath)
        if (indexStats.isFile()) {
          return indexPath
        }
      } catch {
        // index.ts 不存在
      }
    }
  } catch {
    // 路径不存在
  }
  
  return null
}

// 创建路径解析插件
function createPathResolverPlugin(): Plugin {
  const coreSrc = path.resolve(__dirname, '../../packages/core/src')
  const visualizerSrc = path.resolve(__dirname, '../../packages/visualizer/src')
  
  return {
    name: 'path-resolver',
    enforce: 'pre',
    resolveId(id, importer) {
      // 只处理 @/ 开头的导入
      if (!id.startsWith('@/')) return null
      
      const subPath = id.slice(2) // 去掉 @/
      
      if (!importer) {
        // 没有 importer 时，默认解析到 core
        const resolved = resolveFilePath(path.join(coreSrc, subPath), '')
        return resolved
      }
      
      // 根据 importer 的来源确定解析目标
      const normalizedImporter = path.normalize(importer)
      
      let baseSrc: string
      if (normalizedImporter.includes('packages' + path.sep + 'core' + path.sep + 'src')) {
        baseSrc = coreSrc
      } else if (normalizedImporter.includes('packages' + path.sep + 'visualizer' + path.sep + 'src')) {
        baseSrc = visualizerSrc
      } else {
        baseSrc = coreSrc
      }
      
      const resolved = resolveFilePath(path.join(baseSrc, subPath), '')
      return resolved
    },
  }
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
  optimizeDeps: {
    // 排除对这些包的预构建，避免动态导入警告
    exclude: ['undici', 'fetch-socks', 'langsmith', '@langfuse/openai'],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    createPathResolverPlugin(),
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          resolve: { alias },
          define,
          plugins: [createPathResolverPlugin()],
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          resolve: { alias },
          define,
          plugins: [createPathResolverPlugin()],
        },
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
})
