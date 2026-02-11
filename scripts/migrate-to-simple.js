#!/usr/bin/env node
/**
 * 迁移脚本：将 monorepo packages 合并到简单 Electron 项目
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEST = path.join(ROOT, 'omni-electron');

// 迁移配置
const migrations = [
  {
    name: 'core-runtime',
    src: 'packages/core-runtime/src',
    dest: 'src/main/core',
    imports: {
      '@omni/shared-runtime': '../../../shared-runtime',
      '@omni/shared-types': '../../../types',
      '@omni/drivers-interface': '../../drivers'
    }
  },
  {
    name: 'visualizer',
    src: 'packages/visualizer/src',
    dest: 'src/renderer/components',
    imports: {
      '@omni/core-types': '../../types',
      '@omni/shared-types': '../../types',
      '@omni/playground-client': '../../main/playground'
    }
  },
  {
    name: 'playground-runtime',
    src: 'packages/playground-runtime/src',
    dest: 'src/main/playground',
    imports: {
      '@omni/core-runtime': '../core',
      '@omni/shared-runtime': '../../shared-runtime',
      '@omni/shared-types': '../../types'
    }
  },
  {
    name: 'ipc-main',
    src: 'packages/ipc-main/src',
    dest: 'src/main/ipc',
    imports: {
      '@omni/ipc-contract': '../ipc-contract'
    }
  },
  {
    name: 'ipc-contract',
    src: 'packages/ipc-contract/src',
    dest: 'src/main/ipc-contract',
    imports: {}
  },
  {
    name: 'shared-runtime',
    src: 'packages/shared-runtime/src',
    dest: 'src/shared-runtime',
    imports: {
      '@omni/shared-types': '../types'
    }
  },
  {
    name: 'types',
    src: 'packages/shared-types/src',
    dest: 'src/types',
    imports: {}
  }
];

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function updateImports(filePath, importMap) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  for (const [oldImport, newImport] of Object.entries(importMap)) {
    // 替换各种 import 形式
    const patterns = [
      new RegExp(`from ['"]${oldImport}['"]`, 'g'),
      new RegExp(`from ['"]${oldImport}/([^'"]+)['"]`, 'g'),
      new RegExp(`import\(['"]${oldImport}['"]\)`, 'g'),
      new RegExp(`import\(['"]${oldImport}/([^'"]+)['"]\)`, 'g')
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, subpath) => {
          if (subpath) {
            return match.replace(oldImport, newImport).replace(`/${subpath}`, `/${subpath}`);
          }
          return match.replace(oldImport, newImport);
        });
        modified = true;
      }
    }
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`  ✓ 更新导入: ${path.relative(DEST, filePath)}`);
  }
}

async function processDirectory(dir, importMap) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath, importMap);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      await updateImports(fullPath, importMap);
    }
  }
}

async function migrate() {
  console.log('🚀 开始迁移...\n');
  
  for (const migration of migrations) {
    const srcPath = path.join(ROOT, migration.src);
    const destPath = path.join(DEST, migration.dest);
    
    console.log(`📦 ${migration.name}`);
    console.log(`   从: ${migration.src}`);
    console.log(`   到: ${migration.dest}`);
    
    try {
      await fs.access(srcPath);
      await copyDir(srcPath, destPath);
      await processDirectory(destPath, migration.imports);
      console.log(`   ✅ 完成\n`);
    } catch (err) {
      console.log(`   ⚠️  跳过: ${err.message}\n`);
    }
  }
  
  console.log('✨ 迁移完成！');
  console.log(`\n下一步：`);
  console.log(`  1. 复制 apps/desktop-react 的 electron 配置`);
  console.log(`  2. 合并 package.json 依赖`);
  console.log(`  3. 删除 packages/ 和 apps/ 目录`);
  console.log(`  4. 移动 omni-electron 到根目录`);
}

migrate().catch(console.error);
