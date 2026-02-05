# 03 路线图与里程碑

日期: 2026-02-05

阶段 1: 脚手架与基础
- Monorepo 初始化 (pnpm workspace)
- Electron + React + Vite
- 基础 IPC 桥接

阶段 2: Core 适配
- packages/core: Midscene Agent 封装
- createAgent(adapter) 与基础调用链

阶段 3: Android 驱动 (Aya 风格)
- adbkit 设备发现
- scrcpy server 启动与视频流
- 渲染端解码 + 触控

阶段 4: HarmonyOS 驱动 (Echo 风格)
- hdckit UiDriver
- startCaptureScreen + touchDown/Move/Up
- 屏幕流 JPEG 渲染

阶段 5: Web 驱动
- PlaywrightAgent 封装
- capture/tap/scroll/keyboard

阶段 6: 统一 Agent Loop 与 UI
- Electron Main TaskScheduler
- Renderer 任务流转与状态展示
- 回放与报告查看（@omni/visualizer）

阶段 7: 稳定性与打包
- 资源路径适配
- 错误处理与重试
- Electron 打包
