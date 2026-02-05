/**
 * Canvas-based fallback for image processing when Photon WASM fails to load.
 * Provides a compatible API with Photon for browser environments.
 */

import { getDebug } from '../logger';

const debug = getDebug('img:canvas-fallback');

export class CanvasImage {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }
    this.ctx = ctx;
    this._width = canvas.width;
    this._height = canvas.height;
  }

  get_width(): number {
    return this._width;
  }

  get_height(): number {
    return this._height;
  }

  get_raw_pixels(): Uint8Array {
    const imageData = this.ctx.getImageData(0, 0, this._width, this._height);
    return new Uint8Array(imageData.data.buffer);
  }

  get_bytes_jpeg(quality: number): Uint8Array {
    const dataUrl = this.canvas.toDataURL('image/jpeg', quality / 100);
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  free(): void {
    // No-op for Canvas, garbage collector will handle it
  }

  _getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  _getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  static async new_from_base64(base64Body: string): Promise<CanvasImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2d context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(new CanvasImage(canvas));
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      if (base64Body.startsWith('data:')) {
        img.src = base64Body;
      } else {
        img.src = `data:image/png;base64,${base64Body}`;
      }
    });
  }

  static async new_from_byteslice(bytes: Uint8Array): Promise<CanvasImage> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to get 2d context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(new CanvasImage(canvas));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image from bytes'));
      };

      img.src = url;
    });
  }
}

export const CanvasSamplingFilter = {
  Nearest: 'nearest',
  Triangle: 'triangle',
  CatmullRom: 'catmullrom',
  Gaussian: 'gaussian',
  Lanczos3: 'lanczos3',
} as const;

export class CanvasRgba {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

export function canvasResize(
  image: CanvasImage,
  newWidth: number,
  newHeight: number,
  _filter: string,
): CanvasImage {
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image._getCanvas(), 0, 0, newWidth, newHeight);
  return new CanvasImage(canvas);
}

export function canvasCrop(
  image: CanvasImage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): CanvasImage {
  const width = x2 - x1;
  const height = y2 - y1;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }
  ctx.drawImage(image._getCanvas(), x1, y1, width, height, 0, 0, width, height);
  return new CanvasImage(canvas);
}

export function canvasPaddingRight(
  image: CanvasImage,
  padding: number,
  color: CanvasRgba,
): CanvasImage {
  const newWidth = image.get_width() + padding;
  const height = image.get_height();
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  ctx.fillRect(0, 0, newWidth, height);
  ctx.drawImage(image._getCanvas(), 0, 0);
  return new CanvasImage(canvas);
}

export function canvasPaddingBottom(
  image: CanvasImage,
  padding: number,
  color: CanvasRgba,
): CanvasImage {
  const width = image.get_width();
  const newHeight = image.get_height() + padding;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  ctx.fillRect(0, 0, width, newHeight);
  ctx.drawImage(image._getCanvas(), 0, 0);
  return new CanvasImage(canvas);
}

export function canvasPaddingUniform(
  image: CanvasImage,
  padding: number,
  color: CanvasRgba,
): CanvasImage {
  const newWidth = image.get_width() + padding * 2;
  const newHeight = image.get_height() + padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  ctx.fillRect(0, 0, newWidth, newHeight);
  ctx.drawImage(image._getCanvas(), padding, padding);
  return new CanvasImage(canvas);
}

export function canvasPaddingLeft(
  image: CanvasImage,
  padding: number,
  color: CanvasRgba,
): CanvasImage {
  const newWidth = image.get_width() + padding;
  const height = image.get_height();
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  ctx.fillRect(0, 0, newWidth, height);
  ctx.drawImage(image._getCanvas(), padding, 0);
  return new CanvasImage(canvas);
}

export function canvasPaddingTop(
  image: CanvasImage,
  padding: number,
  color: CanvasRgba,
): CanvasImage {
  const width = image.get_width();
  const newHeight = image.get_height() + padding;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  ctx.fillRect(0, 0, width, newHeight);
  ctx.drawImage(image._getCanvas(), 0, padding);
  return new CanvasImage(canvas);
}

export function canvasWatermark(
  base: CanvasImage,
  overlay: CanvasImage,
  x: number,
  y: number,
): CanvasImage {
  const canvas = document.createElement('canvas');
  canvas.width = base.get_width();
  canvas.height = base.get_height();
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  ctx.drawImage(base._getCanvas(), 0, 0);
  ctx.drawImage(overlay._getCanvas(), x, y);
  return new CanvasImage(canvas);
}

export function createCanvasFallbackModule() {
  debug('Creating Canvas fallback module');
  console.log(
    '[midscene:img] Using Canvas fallback (Photon WASM not available)',
  );

  return {
    PhotonImage: CanvasImage,
    SamplingFilter: CanvasSamplingFilter,
    resize: canvasResize,
    crop: canvasCrop,
    open_image: () => {
      throw new Error('open_image not supported in Canvas fallback');
    },
    base64_to_image: CanvasImage.new_from_base64,
    padding_uniform: canvasPaddingUniform,
    padding_left: canvasPaddingLeft,
    padding_right: canvasPaddingRight,
    padding_top: canvasPaddingTop,
    padding_bottom: canvasPaddingBottom,
    watermark: canvasWatermark,
    Rgba: CanvasRgba,
  };
}
