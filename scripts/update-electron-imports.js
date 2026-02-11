#!/usr/bin/env node
/**
 * 更新 electron 文件中的导入路径
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ELECTRON_DIR = path.join(__dirname, '..', 'omni-electron', 'electron');

const importReplacements = {
  '@omni/playground-runtime': '../src/main/playground',
  '@omni/core-runtime': '../src/main/core',
  '@omni/core-runtime/device': '../src/main/core/device',
  '@omni/ipc-contract': '../src/main/ipc-contract',
  '@omni/ipc-main': '../src/main/ipc',
  '@omni/shared-types/constants': '../src/types/constants',
};

async function updateFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  for (const [oldImport, newImport] of Object.entries(importReplacements)) {
    // 替换 import ... from 'xxx'
    const importPattern = new RegExp(`from ['"]${oldImport}['"]`, 'g');
    if (importPattern.test(content)) {
      content = content.replace(importPattern, `from '${newImport}'`);
      modified = true;
    }
    
    // 替换 import ... from 'xxx/yyy'
    const subPathPattern = new RegExp(`from ['"]${oldImport}/([^'"]+)['"]`, 'g');
    if (subPathPattern.test(content)) {
      content = content.replace(subPathPattern, (match, subpath) => {
        return `from '${newImport}/${subpath}'`;
      });
      modified = true;
    }
    
    // 替换 import('xxx')
    const dynamicPattern = new RegExp(`import\\(['"]${oldImport}['"]\\)`, 'g');
    if (dynamicPattern.test(content)) {
      content = content.replace(dynamicPattern, `import('${newImport}')`);
      modified = true;
    }
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ 更新: ${path.basename(filePath)}`);
  }
}

async function main() {
  const files = await fs.readdir(ELECTRON_DIR);
  
  for (const file of files) {
    if (file.endsWith('.ts')) {
      await updateFile(path.join(ELECTRON_DIR, file));
    }
  }
  
  console.log('\n✅ Electron 导入路径更新完成');
}

main().catch(console.error);
