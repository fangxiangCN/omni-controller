/**
 * IndexedDB 管理工具
 * 
 * 注意：这是一个简化实现，用于修复构建错误。
 * 如果需要完整功能，需要进一步实现。
 */

export interface IndexedDBConfig {
  dbName: string
  version: number
  stores: string[]
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null
  private config: IndexedDBConfig

  constructor(config: IndexedDBConfig) {
    this.config = config
  }

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        for (const storeName of this.config.stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
          }
        }
      }
    })
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  getDatabase(): IDBDatabase | null {
    return this.db
  }
}

export interface CleanupFunction {
  (): void
}

/**
 * 创建清理函数
 */
export function createCleanupFunction(...cleaners: (() => void)[]): CleanupFunction {
  return () => {
    for (const cleaner of cleaners) {
      try {
        cleaner()
      } catch (e) {
        // 忽略清理错误
      }
    }
  }
}

/**
 * 带错误处理的包装函数
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error) => void
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      return fn(...args)
    } catch (error) {
      if (errorHandler && error instanceof Error) {
        errorHandler(error)
      }
      return undefined
    }
  }
}
