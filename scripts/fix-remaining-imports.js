#!/usr/bin/env node
/**
 * 修复剩余的 @omni/ 引用
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, '..', 'omni-electron', 'src');

const replacements = [
  {
    file: 'renderer/layout/TitleBar.tsx',
    changes: [
      ['@omni/ipc-contract', '../main/ipc-contract']
    ]
  },
  {
    file: 'renderer/components/ScreenCanvas.tsx',
    changes: [
      ['@omni/ipc-contract', '../main/ipc-contract']
    ]
  },
  {
    file: 'shared-runtime/mcp/tool-generator.ts',
    changes: [
      ['@omni/shared-runtime/img', '../img']
    ]
  },
  {
    file: 'shared-runtime/mcp/base-tools.ts',
    changes: [
      ['@omni/shared-runtime/img', '../img'],
      ['@omni/shared-runtime/logger', '../logger']
    ]
  }
];

async function updateFile(filePath, changes) {
  const fullPath = path.join(SRC_DIR, filePath);
  
  try {
    let content = await fs.readFile(fullPath, 'utf-8');
    let modified = false;
    
    for (const [oldImport, newImport] of changes) {
      const pattern = new RegExp(`from ['"]${oldImport}['"]`, 'g');
      if (pattern.test(content)) {
        content = content.replace(pattern, `from '${newImport}'`);
        modified = true;
      }
      
      // 也替换子路径
      const subPathPattern = new RegExp(`from ['"]${oldImport}/([^'"]+)['"]`, 'g');
      if (subPathPattern.test(content)) {
        content = content.replace(subPathPattern, (match, subpath) => {
          return `from '${newImport}/${subpath}'`;
        });
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(fullPath, content, 'utf-8');
      console.log(`✓ 修复: ${filePath}`);
    }
  } catch (err) {
    console.log(`✗ 失败: ${filePath} - ${err.message}`);
  }
}

async function main() {
  for (const { file, changes } of replacements) {
    await updateFile(file, changes);
  }
  
  console.log('\n✅ 剩余引用修复完成');
  console.log('\n注意: 以下文件中的引用是文档/注释，无需修改:');
  console.log('  - types/constants/example-code.ts (示例代码)');
  console.log('  - main/playground/launcher.ts (注释)');
  console.log('  - renderer/components/component/misc/index.tsx (UI 文本)');
  console.log('  - main/core/ai-model/prompt/playwright-generator.ts (提示词模板)');
}

main().catch(console.error);
