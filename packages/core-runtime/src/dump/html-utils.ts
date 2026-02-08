import { closeSync, openSync, readSync, statSync } from 'node:fs';
import { antiEscapeScriptTag, escapeScriptTag } from '@omni/shared-types/utils';

export const escapeContent = escapeScriptTag;
export const unescapeContent = antiEscapeScriptTag;

/** Chunk size for streaming file operations (64KB) */
export const STREAMING_CHUNK_SIZE = 64 * 1024;

type TagMatchCallback = (content: string) => boolean;

export function streamScanTags(
  filePath: string,
  openTag: string,
  closeTag: string,
  onMatch: TagMatchCallback,
): void {
  const fd = openSync(filePath, 'r');
  const fileSize = statSync(filePath).size;
  const buffer = new Uint8Array(STREAMING_CHUNK_SIZE);
  const decoder = new TextDecoder('utf-8');

  let position = 0;
  let leftover = '';
  let capturing = false;
  let currentContent = '';

  try {
    while (position < fileSize) {
      const bytesRead = readSync(fd, buffer, 0, STREAMING_CHUNK_SIZE, position);
      const chunk = leftover + decoder.decode(buffer.subarray(0, bytesRead));
      position += bytesRead;

      let searchStart = 0;

      while (searchStart < chunk.length) {
        if (!capturing) {
          const startIdx = chunk.indexOf(openTag, searchStart);
          if (startIdx !== -1) {
            capturing = true;
            currentContent = chunk.slice(startIdx + openTag.length);
            const endIdx = currentContent.indexOf(closeTag);
            if (endIdx !== -1) {
              const shouldStop = onMatch(currentContent.slice(0, endIdx));
              if (shouldStop) return;
              capturing = false;
              currentContent = '';
              searchStart =
                startIdx + openTag.length + endIdx + closeTag.length;
            } else {
              leftover = currentContent.slice(-closeTag.length);
              currentContent = currentContent.slice(0, -closeTag.length);
              break;
            }
          } else {
            leftover = chunk.slice(-openTag.length);
            break;
          }
        } else {
          const endIdx = chunk.indexOf(closeTag, searchStart);
          if (endIdx !== -1) {
            currentContent += chunk.slice(searchStart, endIdx);
            const shouldStop = onMatch(currentContent);
            if (shouldStop) return;
            capturing = false;
            currentContent = '';
            searchStart = endIdx + closeTag.length;
          } else {
            currentContent += chunk.slice(searchStart, -closeTag.length);
            leftover = chunk.slice(-closeTag.length);
            break;
          }
        }
      }
    }
  } finally {
    closeSync(fd);
  }
}

export function extractImageByIdSync(
  htmlPath: string,
  imageId: string,
): string | null {
  const targetTag = `<script type="midscene-image" data-id="${imageId}">`;
  const closeTag = '</script>';

  let result: string | null = null;

  streamScanTags(htmlPath, targetTag, closeTag, (content) => {
    result = unescapeContent(content);
    return true;
  });

  return result;
}

export function streamImageScriptsToFile(
  srcFilePath: string,
  destFilePath: string,
): void {
  const { appendFileSync } = require('node:fs');
  const openTag = '<script type="midscene-image"';
  const closeTag = '</script>';

  streamScanTags(srcFilePath, openTag, closeTag, (content) => {
    appendFileSync(destFilePath, `${openTag}${content}${closeTag}\n`);
    return false;
  });
}

export function extractLastDumpScriptSync(filePath: string): string {
  const openTagPrefix = '<script type="midscene_web_dump"';
  const closeTag = '</script>';

  let lastContent = '';

  const fd = openSync(filePath, 'r');
  const fileSize = statSync(filePath).size;
  const buffer = new Uint8Array(STREAMING_CHUNK_SIZE);
  const decoder = new TextDecoder('utf-8');

  let position = 0;
  let leftover = '';
  let capturing = false;
  let currentContent = '';

  try {
    while (position < fileSize) {
      const bytesRead = readSync(fd, buffer, 0, STREAMING_CHUNK_SIZE, position);
      const chunk = leftover + decoder.decode(buffer.subarray(0, bytesRead));
      position += bytesRead;

      let searchStart = 0;

      while (searchStart < chunk.length) {
        if (!capturing) {
          const startIdx = chunk.indexOf(openTagPrefix, searchStart);
          if (startIdx !== -1) {
            const tagEndIdx = chunk.indexOf('>', startIdx);
            if (tagEndIdx !== -1) {
              capturing = true;
              currentContent = chunk.slice(tagEndIdx + 1);
              const endIdx = currentContent.indexOf(closeTag);
              if (endIdx !== -1) {
                lastContent = currentContent.slice(0, endIdx).trim();
                capturing = false;
                currentContent = '';
                searchStart = tagEndIdx + 1 + endIdx + closeTag.length;
              } else {
                leftover = currentContent.slice(-closeTag.length);
                currentContent = currentContent.slice(0, -closeTag.length);
                break;
              }
            } else {
              leftover = chunk.slice(startIdx);
              break;
            }
          } else {
            leftover = chunk.slice(-openTagPrefix.length);
            break;
          }
        } else {
          const endIdx = chunk.indexOf(closeTag, searchStart);
          if (endIdx !== -1) {
            currentContent += chunk.slice(searchStart, endIdx);
            lastContent = currentContent.trim();
            capturing = false;
            currentContent = '';
            searchStart = endIdx + closeTag.length;
          } else {
            currentContent += chunk.slice(searchStart, -closeTag.length);
            leftover = chunk.slice(-closeTag.length);
            break;
          }
        }
      }
    }
  } finally {
    closeSync(fd);
  }

  return unescapeContent(lastContent);
}

export function parseImageScripts(html: string): Record<string, string> {
  const imageMap: Record<string, string> = {};
  const regex =
    /<script type="midscene-image" data-id="([^"]+)">([\s\S]*?)<\/script>/g;

  for (const match of html.matchAll(regex)) {
    const [, id, content] = match;
    imageMap[id] = unescapeContent(content);
  }

  return imageMap;
}

export function parseDumpScript(html: string): string {
  const regex = /<script type="midscene_web_dump"[^>]*>([\s\S]*?)<\/script>/;
  const match = regex.exec(html);

  if (!match) {
    throw new Error('No dump script found in HTML');
  }

  return unescapeContent(match[1]);
}

export function parseDumpScriptAttributes(
  html: string,
): Record<string, string> {
  const regex = /<script type="midscene_web_dump"([^>]*)>/;
  const match = regex.exec(html);

  if (!match) {
    return {};
  }

  const attrString = match[1];
  const attributes: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;

  for (const attrMatch of attrString.matchAll(attrRegex)) {
    const [, key, value] = attrMatch;
    if (key !== 'type') {
      attributes[key] = decodeURIComponent(value);
    }
  }

  return attributes;
}

export function generateImageScriptTag(id: string, data: string): string {
  return (
    '<script type="midscene-image" data-id="' +
    id +
    '">' +
    escapeContent(data) +
    '</script>'
  );
}

export function generateDumpScriptTag(
  json: string,
  attributes?: Record<string, string>,
): string {
  let attrString = '';
  if (attributes && Object.keys(attributes).length > 0) {
    attrString =
      ' ' +
      Object.entries(attributes)
        .map(([k, v]) => k + '="' + encodeURIComponent(v) + '"')
        .join(' ');
  }

  return (
    '<script type="midscene_web_dump"' +
    attrString +
    '>' +
    escapeContent(json) +
    '</script>'
  );
}
