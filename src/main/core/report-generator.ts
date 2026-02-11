import {
  existsSync,
  mkdirSync,
  statSync,
  truncateSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { getRunSubDir } from '@shared/common';
import { ifInBrowser, logMsg } from '../../../types/utils';
import {
  generateDumpScriptTag,
  generateImageScriptTag,
} from './dump/html-utils';
import type { GroupedActionDump } from './types';
import { appendFileSync, getReportTpl } from './utils';

export interface IReportGenerator {
  /**
   * Schedule a dump update. Writes are queued internally to guarantee serial execution.
   * This method returns immediately (fire-and-forget).
   * Screenshots are written and memory is released during this call.
   */
  onDumpUpdate(dump: GroupedActionDump): void;
  /**
   * Wait for all queued write operations to complete.
   */
  flush(): Promise<void>;
  /**
   * Finalize the report. Calls flush() internally before printing the final message.
   */
  finalize(dump: GroupedActionDump): Promise<string | undefined>;
  getReportPath(): string | undefined;
}

export const nullReportGenerator: IReportGenerator = {
  onDumpUpdate: () => {},
  flush: async () => {},
  finalize: async () => undefined,
  getReportPath: () => undefined,
};

export class ReportGenerator implements IReportGenerator {
  private reportPath: string;
  private screenshotMode: 'inline' | 'directory';
  private autoPrint: boolean;
  private writtenScreenshots = new Set<string>();

  private imageEndOffset = 0;
  private initialized = false;

  private writeQueue: Promise<void> = Promise.resolve();
  private destroyed = false;

  constructor(options: {
    reportPath: string;
    screenshotMode: 'inline' | 'directory';
    autoPrint?: boolean;
  }) {
    this.reportPath = options.reportPath;
    this.screenshotMode = options.screenshotMode;
    this.autoPrint = options.autoPrint ?? true;
  }

  static create(
    reportFileName: string,
    opts: {
      generateReport?: boolean;
      outputFormat?: 'single-html' | 'html-and-external-assets';
      autoPrintReportMsg?: boolean;
    },
  ): IReportGenerator {
    if (opts.generateReport === false) return nullReportGenerator;

    if (ifInBrowser) return nullReportGenerator;

    if (opts.outputFormat === 'html-and-external-assets') {
      const outputDir = join(getRunSubDir('report'), reportFileName);
      return new ReportGenerator({
        reportPath: join(outputDir, 'index.html'),
        screenshotMode: 'directory',
        autoPrint: opts.autoPrintReportMsg,
      });
    }

    return new ReportGenerator({
      reportPath: join(getRunSubDir('report'), `${reportFileName}.html`),
      screenshotMode: 'inline',
      autoPrint: opts.autoPrintReportMsg,
    });
  }

  onDumpUpdate(dump: GroupedActionDump): void {
    this.writeQueue = this.writeQueue.then(() => {
      if (this.destroyed) return;
      this.doWrite(dump);
    });
  }

  async flush(): Promise<void> {
    await this.writeQueue;
  }

  async finalize(dump: GroupedActionDump): Promise<string | undefined> {
    this.onDumpUpdate(dump);
    await this.flush();
    this.destroyed = true;

    if (this.autoPrint && this.reportPath) {
      if (this.screenshotMode === 'directory') {
        console.log('\n[Omni] Directory report generated.');
        console.log(
          '[Omni] Note: This report must be served via HTTP server due to CORS restrictions.',
        );
        console.log(`[Omni] Example: npx serve ${dirname(this.reportPath)}`);
      } else {
        logMsg(`Omni - report file updated: ${this.reportPath}`);
      }
    }

    return this.reportPath;
  }

  getReportPath(): string | undefined {
    return this.reportPath;
  }

  private doWrite(dump: GroupedActionDump): void {
    if (this.screenshotMode === 'inline') {
      this.writeInlineReport(dump);
    } else {
      this.writeDirectoryReport(dump);
    }
  }

  private writeInlineReport(dump: GroupedActionDump): void {
    const dir = dirname(this.reportPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!this.initialized) {
      writeFileSync(this.reportPath, getReportTpl());
      this.imageEndOffset = statSync(this.reportPath).size;
      this.initialized = true;
    }

    truncateSync(this.reportPath, this.imageEndOffset);

    const screenshots = dump.collectAllScreenshots();
    for (const screenshot of screenshots) {
      if (!this.writtenScreenshots.has(screenshot.id)) {
        appendFileSync(
          this.reportPath,
          `\n${generateImageScriptTag(screenshot.id, screenshot.base64)}`,
        );
        this.writtenScreenshots.add(screenshot.id);
        screenshot.markPersistedInline(this.reportPath);
      }
    }

    this.imageEndOffset = statSync(this.reportPath).size;

    const serialized = dump.serialize();
    appendFileSync(this.reportPath, `\n${generateDumpScriptTag(serialized)}`);
  }

  private writeDirectoryReport(dump: GroupedActionDump): void {
    const dir = dirname(this.reportPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const screenshotsDir = join(dir, 'screenshots');
    if (!existsSync(screenshotsDir)) {
      mkdirSync(screenshotsDir, { recursive: true });
    }

    const screenshots = dump.collectAllScreenshots();
    for (const screenshot of screenshots) {
      if (!this.writtenScreenshots.has(screenshot.id)) {
        const absolutePath = join(screenshotsDir, `${screenshot.id}.png`);
        const buffer = Buffer.from(screenshot.rawBase64, 'base64');
        writeFileSync(absolutePath, new Uint8Array(buffer));
        screenshot.markPersistedToPath(
          `./screenshots/${screenshot.id}.png`,
          absolutePath,
        );
        this.writtenScreenshots.add(screenshot.id);
      }
    }

    const serialized = dump.serialize();
    writeFileSync(this.reportPath, getReportTpl(), { flag: 'w' });
    appendFileSync(this.reportPath, `\n${generateDumpScriptTag(serialized)}`);
  }
}
