# 01 项目愿景与范围

日期: 2026-02-02

愿景
- 构建源码级可控的跨平台自动化操作终端
- 统一界面 + 自然语言指令, 同时控制 Android / HarmonyOS / Web
- 复用开源项目的核心逻辑, 不依赖黑盒服务

范围
- 设备接入: Android (adbkit+scrcpy), HarmonyOS (hdckit+UiDriver), Web (Playwright+Midscene)
- AI 核心: Midscene Agent + TaskExecutor + Service
- UI: Electron + Vue 3 + TDesign
- 任务闭环: 捕获 -> 规划 -> 执行 -> 记录 -> 展示

不在范围(短期)
- iOS 设备驱动
- 远程云端设备农场
- 多租户权限体系

关键约束
- AI 输出格式只支持 Midscene 模式
- 资源路径需兼容开发与打包环境
