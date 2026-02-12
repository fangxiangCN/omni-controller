# macOS ADB 适配说明

## 问题
项目原本使用 Windows 版本的 `adb.exe`，在 macOS 上需要适配。

## 解决方案

### 方法一：使用 Homebrew 安装（推荐）

```bash
brew install android-platform-tools
```

安装后系统会自动在 PATH 中找到 adb。

### 方法二：自动下载脚本

运行提供的脚本下载 adb：

```bash
./scripts/setup-adb-macos.sh
```

这会下载 Android SDK Platform Tools 到项目目录。

### 方法三：手动下载

1. 从 [Android 官网](https://developer.android.com/studio/releases/platform-tools) 下载 macOS 版本
2. 解压后将 `adb` 可执行文件放到项目根目录
3. 赋予执行权限：

```bash
chmod +x adb
```

### 方法四：使用 Android Studio 安装的 SDK

如果您已安装 Android Studio，adb 通常位于：

```
~/Library/Android/sdk/platform-tools/adb
```

程序会自动检测此路径。

## 验证安装

```bash
adb version
```

## 代码改动

### 新增文件

1. `src/main/utils/adb-resolver.ts` - ADB 路径解析工具
   - 自动查找项目目录中的 adb
   - 搜索系统 PATH 中的 adb
   - 检查常见安装位置

2. `scripts/setup-adb-macos.sh` - macOS 自动下载脚本

### 修改文件

1. `src/main/index.ts`
   - 更新 `testAdb()` 函数支持动态路径
   - 使用 `findAdbPath()` 查找 adb

2. `src/main/ipc/index.ts`
   - 使用 `findAdbPath()` 替代硬编码路径
   - 支持所有平台（Windows、macOS、Linux）

## 启动应用

安装 adb 后：

```bash
pnpm dev
```

如果控制台显示：
```
[ADB] Using adb: /path/to/adb
[ADB Test] ADB version: Android Debug Bridge version x.x.x
```

说明 adb 配置成功！
