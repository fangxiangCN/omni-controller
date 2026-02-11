#!/usr/bin/env node
/**
 * 更新渲染进程文件中的导入路径
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDERER_DIR = path.join(__dirname, '..', 'omni-electron', 'src', 'renderer');

const importReplacements = {
  '@omni/visualizer': './components',
  '@omni/playground-client': '../main/playground',
  '@omni/core-types': '../types',
  '@omni/shared-types': '../types',
  '@omni/ipc-client': './ipc',
};

async function updateFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  for (const [oldImport, newImport] of Object.entries(importReplacements)) {
    const patterns = [
      new RegExp(`from ['"]${oldImport}['"]`, 'g'),
      new RegExp(`from ['"]${oldImport}/([^'"]+)['"]`, 'g'),
      new RegExp(`import\\(['"]${oldImport}['"]\\)`, 'g'),
      new RegExp(`import\\(['"]${oldImport}/([^'"]+)['"]\\)`, 'g'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, subpath) => {
          if (subpath) {
            return match.replace(oldImport, newImport);
          }
          return match.replace(oldImport, newImport);
        });
        modified = true;
      }
    }
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ 更新: ${path.relative(RENDERER_DIR, filePath)}`);
  }
}

async function processDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      await updateFile(fullPath);
    }
  }
}

async function main() {
  await processDir(RENDERER_DIR);
  console.log('\n✅ 渲染进程导入路径更新完成');
}

main().catch(console.error);
