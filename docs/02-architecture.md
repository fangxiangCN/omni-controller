# 02 架构与核心模块

日期: 2026-02-05

总体结构
- apps/desktop-react: Electron 主应用 (main/renderer/preload)
- packages/core: Midscene Agent 适配层
- packages/drivers: Android / HarmonyOS / Web 驱动
- packages/shared: IPC 事件与通用类型
- packages/visualizer: Midscene visualizer 迁移
- packages/playground: Midscene playground 迁移
- packages/web: Midscene web-integration 迁移
- resources/bin: adb/hdc/uitest_agent 等二进制资源

核心模块
1) Core (Midscene)
- 入口: Agent.aiAct(), aiLocate(), aiTap()/aiInput()/aiScroll()
- 依赖: TaskExecutor + Service
- 特性: screenshot scale 处理, report dump, cache, replanning
- 实现来源: references/midscene 源码融合到 packages/core 与 packages/shared（最小依赖集）

2) Drivers
- 统一设备抽象: IDeviceAdapter (见 05-interfaces.md)
- Android: adbkit + scrcpy server + @yume-chan/scrcpy 解码
- HarmonyOS: hdckit UiDriver + startCaptureScreen(JPEG)
- Web: PlaywrightAgent (Midscene web-integration)

3) Renderer
- Android: WebCodecs 解码 H.264
- HarmonyOS: JPEG 直接 drawImage
- Web: screenshot 或 DOM 展示
- Timeline: 展示 Agent 执行日志
- UI: React + Ant Design，报告与回放使用 @omni/visualizer

统一 Agent Loop
- 获取 UIContext
- Agent.aiAct 规划
- 调用 Adapter.actionSpace 执行
- 写日志与帧, 更新 UI

当前实现补充
- main: 已接入 IPC（task:start / task:log / task:state / report:update / device:list / device:frame / device:select）
- Android: adbkit + scrcpy reverseTcp 已打通，H.264 通过 IPC 流入 renderer
- renderer: React UI 框架已搭建，Task 输入/Timeline 与 Report 回放/历史接入中
- reports: 主进程持久化 `reports/index.json` 与 `report-*.html`
- shell: TitleBar 窗口控制与主题切换已接入

约束
- AI 输出仅 Midscene 模式
- Scrcpy 音频/控制/视频连接顺序需识别
- Scrcpy 使用 scid 与 localabstract:scrcpy_{scid} 对齐
- HarmonyOS UiDriver 依赖固定版本 so
