/**
 * Recursively restore image references in parsed data.
 * Replaces { $screenshot: "id" } with { base64: "..." } values from imageMap.
 * Used by Playground and Extension to render images.
 */
export function restoreImageReferences<T>(
  data: T,
  imageMap: Record<string, string>,
): T {
  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => restoreImageReferences(item, imageMap)) as T;
  }

  if (typeof data === 'object' && data !== null) {
    if ('$screenshot' in data) {
      const id = (data as { $screenshot: unknown }).$screenshot;
      if (typeof id === 'string') {
        if (imageMap[id]) {
          return { base64: imageMap[id] } as T;
        }
        if (
          id.startsWith('data:image/') ||
          id.startsWith('./') ||
          id.startsWith('/')
        ) {
          return { base64: id } as T;
        }
        return { base64: `./screenshots/${id}.png` } as T;
      }
      console.warn('Invalid $screenshot value type:', typeof id);
      return { base64: '' } as T;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = restoreImageReferences(value, imageMap);
    }
    return result as T;
  }

  return data;
}
