import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

/**
 * Find ADB executable path based on platform
 * Priority:
 * 1. Bundled adb in project directory
 * 2. System PATH adb (Android SDK or standalone)
 * 3. Common installation locations
 */
export function findAdbPath(): string | null {
  const isWin = process.platform === 'win32'
  const adbBinary = isWin ? 'adb.exe' : 'adb'

  // 1. Check bundled adb in project directory (dev mode)
  const isDev = !app.isPackaged
  if (isDev) {
    const bundledPath = join(process.cwd(), adbBinary)
    if (existsSync(bundledPath)) {
      console.log('[ADB] Found bundled adb:', bundledPath)
      return bundledPath
    }
  }

  // 2. Check bundled adb in app resources (production)
  if (!isDev) {
    const resourcesPath = join(path.dirname(app.getPath('exe')), adbBinary)
    if (existsSync(resourcesPath)) {
      console.log('[ADB] Found bundled adb in resources:', resourcesPath)
      return resourcesPath
    }
  }

  // 3. Try system PATH
  try {
    const whichCmd = isWin ? 'where' : 'which'
    const result = execSync(`${whichCmd} ${adbBinary}`, { encoding: 'utf8', timeout: 5000 })
    const systemPath = result.trim().split('\n')[0].trim()
    if (systemPath && existsSync(systemPath)) {
      console.log('[ADB] Found system adb:', systemPath)
      return systemPath
    }
  } catch {
    // Not found in PATH
  }

  // 4. Check common installation locations
  const commonPaths = getCommonAdbPaths()
  for (const path of commonPaths) {
    if (existsSync(path)) {
      console.log('[ADB] Found adb in common location:', path)
      return path
    }
  }

  console.error('[ADB] ADB not found in any location')
  return null
}

/**
 * Get platform-specific common ADB installation paths
 */
function getCommonAdbPaths(): string[] {
  const isWin = process.platform === 'win32'
  const home = process.env.HOME || process.env.USERPROFILE || ''

  if (isWin) {
    return [
      'C:\\Program Files (x86)\\Android\\android-sdk\\platform-tools\\adb.exe',
      'C:\\Program Files\\Android\\android-sdk\\platform-tools\\adb.exe',
      'C:\\Android\\android-sdk\\platform-tools\\adb.exe',
      join(home, 'AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe'),
    ]
  } else if (process.platform === 'darwin') {
    // macOS
    return [
      '/usr/local/bin/adb',
      '/opt/homebrew/bin/adb',
      '/opt/local/bin/adb',
      join(home, 'Library/Android/sdk/platform-tools/adb'),
      join(home, 'android-sdk/platform-tools/adb'),
      '/Applications/Android Studio.app/Contents/sdk/platform-tools/adb',
    ]
  } else {
    // Linux
    return [
      '/usr/bin/adb',
      '/usr/local/bin/adb',
      '/opt/android-sdk/platform-tools/adb',
      join(home, 'Android/Sdk/platform-tools/adb'),
      join(home, 'android-sdk/platform-tools/adb'),
    ]
  }
}

// Import path for production path joining
import * as path from 'path'
