# Omni-Controller 全局开发 Guide（对齐 references 真实实现）

版本: v2.2.0
日期: 2026-02-05
适用: Codex/Cursor/Copilot 与核心开发者

说明
- 本 Guide 是项目的“总纲”，与 docs/ 中其它文档保持一致。
- AI 输出仅支持 Midscene 模式（不再维护 Open-AutoGLM 输出格式）。
- 参考项目：Aya(Android)、Echo(HarmonyOS)、Midscene(Web/Agent)。

---

## 0. 参考实现映射

- Android: `references/aya`（Electron + adbkit + scrcpy + @yume-chan/scrcpy）
- HarmonyOS: `references/echo`（Electron + hdckit + UiDriver）
- AI Core / Web: `references/midscene`（源码已融入 packages/core、packages/shared、packages/visualizer、packages/playground、packages/web）

---

## 1. 项目目标

构建一个跨平台自动化操作终端：
- 统一 UI 与自然语言指令
- 支持 Android / HarmonyOS / Web 设备驱动
- 核心执行逻辑复用 Midscene Agent

---

## 2. 技术栈（已落地）

- Runtime: Electron + Node.js
- Frontend: React + Vite
- UI: Ant Design
- State: Zustand
- Lang: TypeScript
- Monorepo: pnpm workspace (`apps/*`, `packages/*`)

---

## 3. 目录结构（与当前仓库一致）

```
omni-controller/
  apps/
    desktop-react/
      electron/            # main/preload/IPC
      src/                 # renderer (React + AntD + @omni/visualizer)
  packages/
    core/                  # Midscene Agent 适配 + Midscene core 源码融合
    shared/                # IPC 类型 + Midscene shared 最小集
    visualizer/            # Midscene visualizer 迁移
    playground/            # Midscene playground 迁移
    web/                   # Midscene web-integration 迁移
    drivers/
      interface/           # IDeviceAdapter 定义
      android/             # Android 驱动（adbkit + scrcpy）
      ohos/                # HarmonyOS 驱动（占位）
      web/                 # Web 驱动（占位）
  resources/
    bin/
      android/scrcpy.jar
```

---

## 4. 当前实现状态

- 阶段 1: DONE（脚手架与依赖）
- 阶段 2: DONE（Midscene Agent 适配）
- 阶段 3: DONE（Android 驱动 + H.264 IPC + 控制通道）
- 阶段 4: TODO（HarmonyOS 驱动）
- 阶段 5: TODO（Web 驱动）
- 阶段 6: DOING（统一 Agent Loop + UI 链路完善）
- 阶段 7: TODO（多端能力补齐/打包）

---

## 5. Android 驱动细节（对齐 Aya）

- ADB: `@devicefarmer/adbkit`
- Scrcpy server:
  - 推送 `resources/bin/android/scrcpy.jar` 至 `/data/local/tmp/omni/scrcpy.jar`
  - 启动命令：
    `CLASSPATH=... app_process /system/bin com.genymobile.scrcpy.Server 3.1 ...`
- 连接顺序：
  - 第一个 socket 为视频流
  - 其它 socket 为音频/控制，需识别 metadata
- reverseTcp：
  - 端口以 `localabstract:scrcpy_{scid}` 反向连接
  - `scid` 与 deviceId hash 对齐 Aya 逻辑
- Renderer 解码：WebCodecs + `@yume-chan/scrcpy-decoder-webcodecs`

---

## 6. IPC 规范（与 packages/shared 对齐）

```ts
export enum IpcChannels {
  START_TASK = 'task:start',
  STOP_TASK = 'task:stop',
  DEVICE_SELECT = 'device:select',
  DEVICE_UPDATE = 'device:list',
  TASK_LOG = 'task:log',
  DEVICE_FRAME = 'device:frame',
  TASK_STATE = 'task:state',
}
```

主链路
- Renderer 选设备 -> `device:select`
- Renderer 发任务 -> `task:start`
- Main 回传设备列表/帧/日志/状态

---

## 7. Agent Loop（当前实现）

- 入口：`apps/desktop-react/electron/main.ts`（IPC 注册已打底）
- Agent 逻辑：`packages/core`（对齐 Midscene Agent）
- 待接入：TaskScheduler + DeviceManager + IPC 全链路（见 UI 文档与 Roadmap）

---

## 8. 约束与注意事项

- 仅支持 Midscene 输出模式
- Scrcpy socket 顺序不固定，需检测音频 metadata
- 资源路径打包后变化，需要在 main 侧处理（后续阶段）

---

## 9. 下一步建议（优先级）

1) Desktop 端：打通 IPC 与 TaskScheduler，完成一条完整链路（选设备 -> 任务执行 -> 日志/进度 -> 结果）
2) Report/Visualizer：对齐 Midscene 报告与回放逻辑（packages/visualizer/playground/web）
3) Android 收尾：控制通道稳定性、异常重连、日志与错误回传细化
