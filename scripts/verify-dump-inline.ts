import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GroupedActionDump } from '../packages/core/src/types';

const basePath = process.argv[2];

if (!basePath) {
  console.error('Usage: pnpm tsx scripts/verify-dump-inline.ts <dumpBasePath>');
  process.exit(1);
}

if (!existsSync(basePath)) {
  console.error(`File not found: ${basePath}`);
  console.error('Tip: use the exact dump path, e.g. F:\\path\\to\\demo.web-dump.json');
  process.exit(1);
}

const outputPath = resolve(`${basePath}.inline.json`);
const inlineJson = GroupedActionDump.fromFilesAsInlineJson(basePath);

writeFileSync(outputPath, inlineJson, 'utf-8');
console.log(`Wrote inline dump JSON to ${outputPath}`);
