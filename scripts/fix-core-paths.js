#!/usr/bin/env node
/**
 * 修复 src/main/core 中的路径别名
 * 将 @/xxx 改为 ./xxx (在同一目录内)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_DIR = path.join(__dirname, '..', 'src', 'main', 'core');

// 这些路径应该被替换为相对路径
const localPaths = [
  '@/ai-model',
  '@/device',
  '@/service',
  '@/utils',
  '@/report-generator',
  '@/types',
  '@/task-runner',
  '@/yaml',
  '@/common',
  '@/dump',
];

async function fixImports(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  for (const localPath of localPaths) {
    // 替换 import ... from '@/xxx'
    const pattern = new RegExp(`from ['"]${localPath}['"]`, 'g');
    const relativePath = './' + localPath.replace('@/', '');
    
    if (pattern.test(content)) {
      content = content.replace(pattern, `from '${relativePath}'`);
      modified = true;
    }
    
    // 替换 import ... from '@/xxx/yyy'
    const subPattern = new RegExp(`from ['"]${localPath}/([^'"]+)['"]`, 'g');
    if (subPattern.test(content)) {
      content = content.replace(subPattern, (match, subpath) => {
        return `from '${relativePath}/${subpath}'`;
      });
      modified = true;
    }
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ 修复: ${path.relative(CORE_DIR, filePath)}`);
  }
}

async function processDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      await fixImports(fullPath);
    }
  }
}

async function main() {
  console.log('🔧 修复 src/main/core 中的路径别名...\n');
  await processDir(CORE_DIR);
  console.log('\n✅ 路径别名修复完成');
}

main().catch(console.error);
