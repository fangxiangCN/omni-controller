这份 Guide 已根据 references 中的真实代码做了对齐与优化（Aya / Echo / Midscene / Open-AutoGLM）。
你可以直接把它作为项目“总纲”，按阶段执行。

---

# Omni-Controller 全栈开发架构白皮书（对齐参考实现）

**版本:** v2.1.0  
**日期:** 2026-02-02  
**适用对象:** AI 辅助编程工具（Codex / Cursor / Copilot）及核心开发人员

## 0. 参考实现基线（已对齐）

- **Android**：`references/aya`（Electron + adbkit + scrcpy + yume-chan/scrcpy）
- **HarmonyOS**：`references/echo`（Electron + hdckit + UiDriver + uitestkit_sdk）
- **AI Core / Web**：`references/midscene`（@midscene/core + @midscene/web-integration）
- **Prompt / 动作格式**：`references/Open-AutoGLM`（<think>/<answer> + do()/finish()）

---

## 1. 项目愿景

构建一个**源码级可控**的跨平台自动化操作终端。  
通过统一界面与自然语言指令，同时控制 **Android / HarmonyOS / Web**。  
底层驱动不依赖黑盒服务，优先复用与移植开源代码的核心逻辑。

---

## 2. 技术栈（对齐代码）

| 层级 | 技术选型 | 备注 |
| --- | --- | --- |
| **Runtime** | **Electron** + Node.js | 主进程负责设备通信与 AI 推理 |
| **Frontend** | **Vue 3** + **Vite** | 渲染进程，Composition API |
| **UI** | **TDesign Vue Next** | 控制台风格 UI |
| **State** | **Pinia** | 全局状态 |
| **Language** | **TypeScript** | 全栈严格类型 |
| **Monorepo** | **pnpm workspace** | `apps/*`, `packages/*` |
| **Android** | **adbkit + scrcpy + @yume-chan/scrcpy** | 与 Aya 保持一致 |
| **HarmonyOS** | **hdckit + UiDriver** | 与 Echo 保持一致 |
| **Web** | **Playwright + @midscene/web-integration** | Midscene 官方集成 |
| **DB** | **better-sqlite3** | 任务记录 / 日志 / Prompt |

---

## 3. 目录结构（建议）

```text
omni-controller/
├── package.json
├── pnpm-workspace.yaml
├── resources/
│   ├── bin/
│   │   ├── android/                 # adb, scrcpy.jar (拷贝自 Aya 结构)
│   │   └── ohos/                    # hdc, uitestkit_sdk/uitest_agent_v1.1.0.so
│   └── prompts/                     # Open-AutoGLM 风格 Prompt 模板
├── apps/
│   └── desktop/
│       ├── src/
│       │   ├── main/                # 主进程 (IPC, Agent Loop)
│       │   ├── renderer/            # UI (Vue + TDesign)
│       │   └── preload/             # 安全桥接
│       └── electron-builder.yml
└── packages/
    ├── core/                        # Midscene core 的适配层 (Agent / TaskExecutor)
    ├── drivers/
    │   ├── interface/               # IDeviceAdapter / 抽象接口
    │   ├── android/                 # Android 驱动 (基于 Aya 实现)
    │   ├── ohos/                    # HarmonyOS 驱动 (基于 Echo 实现)
    │   └── web/                     # Web 驱动 (基于 Midscene web-integration)
    └── shared/                      # IPC 事件 / 通用类型
```

---

## 4. 核心模块设计（对齐真实实现）

### 4.1 AI 核心（Midscene Core）

> 参考：`references/midscene/packages/core`

- **核心类：** `Agent`（不是 InsightAgent）
- **关键入口：**
  - `aiAct(taskPrompt)`：自然语言规划 + 执行
  - `aiLocate(prompt)`：定位元素（返回 rect / center）
  - `aiTap / aiInput / aiScroll / aiAssert / aiWaitFor`
  - `runYaml()`：执行 YAML 流程
- **底层依赖：**
  - `TaskExecutor` + `Service`
  - 自动处理截图缩放（screenshot scale）
  - 支持 cache / replanning / dump 报告

> **结论：** core 不再设计为“plan(screenshot, instruction) -> action”，而是直接复用 Midscene 的 Agent。

---

### 4.2 设备抽象层（与 Midscene 接口对齐）

> Midscene 使用 `AbstractInterface` + `actionSpace()`；我们在此基础上扩展连接能力。

```ts
// packages/drivers/interface/index.ts
export interface IDeviceAdapter /* extends AbstractInterface */ {
  interfaceType: string;

  // 必需：Midscene Agent 依赖
  screenshotBase64(): Promise<string>;
  size(): Promise<{ width: number; height: number; dpr?: number }>;
  actionSpace(): DeviceAction[];

  // 可选：优化性能
  getContext?(): Promise<UIContext>;
  destroy?(): Promise<void>;

  // 设备生命周期
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;

  // 流与输入
  startStream(onFrame: (data: Uint8Array, format: 'h264'|'jpeg') => void): Promise<void>;
  tap(x: number, y: number): Promise<void>;
  type(text: string): Promise<void>;
  scroll(dx: number, dy: number): Promise<void>;
  back(): Promise<void>;
}
```

---

### 4.3 Android 驱动（基于 Aya）

> 参考：`references/aya/src/main/lib/adb/*`、`references/aya/src/renderer/screencast/lib/*`

**关键事实（来自真实代码）：**

1. **ADB 通信：**
   - 使用 `@devicefarmer/adbkit`
   - 支持 `shell`, `reverseTcp`, `forwardTcp`

2. **Scrcpy Server 启动方式：**
   - Push 到 `/data/local/tmp/aya/scrcpy.jar`
   - 通过 `CLASSPATH=... app_process /system/bin com.genymobile.scrcpy.Server 3.1 ...`

3. **Socket 连接顺序（真实实现）：**
   - 第一条连接是 **视频流**
   - 其余连接是 **音频 / 控制**（顺序不固定）
   - 通过读取前 4 字节判断是否是音频流（Opus metadata）

4. **解码与渲染：**
   - Renderer 使用 `@yume-chan/scrcpy` + `@yume-chan/scrcpy-decoder-webcodecs`
   - 视频管线：`parseVideoStreamMetadata` -> `createMediaStreamTransformer` -> `WebCodecsVideoDecoder`

5. **输入控制：**
   - 使用 Scrcpy control channel (`ScrcpyControlMessageWriter`)
   - 支持 touch / scroll / keyCode / clipboard

**实现建议：**

- 主进程：负责 `adbkit` 和 `startScrcpy()`
- 渲染进程：负责 `ScrcpyClient`（解码+输入）
- `startStream()` 输出 H.264 帧或直接输出 Canvas 渲染结果

---

### 4.4 HarmonyOS 驱动（基于 Echo）

> 参考：`references/echo/src/main/lib/hdc/*`

**关键事实（来自真实代码）：**

1. **HDC 通信：**
   - 使用 `hdckit` 的 `Client`
   - `target.createUiDriver(uitest_agent_v1.1.0.so, "1.1.0")`

2. **屏幕流：**
   - `uiDriver.startCaptureScreen(cb, { scale })`
   - 回调返回 **JPEG Uint8Array**

3. **输入：**
   - `uiDriver.touchDown / touchMove / touchUp`
   - `uiDriver.inputText`

4. **UI 层级：**
   - `uiDriver.captureLayout()` 返回 JSON
   - Echo 将 JSON 转为 XML (`dumpWindowHierarchy`)

**实现建议：**

- `resources/bin/ohos/uitestkit_sdk/uitest_agent_v1.1.0.so` 固化版本
- `startStream()` 直接输出 JPEG 帧（无需 H.264 解码）
- 文本输入可参考 Open-AutoGLM 的 `hdc shell uitest uiInput text`

---

### 4.5 Web 驱动（基于 Midscene Web Integration）

> 参考：`references/midscene/packages/web-integration`

- 使用 `PlaywrightAgent`（`@midscene/web-integration/playwright`）
- `PlaywrightAgent` 实际继承 `Agent` 并封装 `WebPage`
- `WebPage` 已实现常用动作：Tap/Scroll/KeyboardPress/Drag/Swipe...

**建议实现：**

- 直接封装 `PlaywrightAgent` 为 `WebAdapter`
- `start()` 创建 `browser + page`
- `capture()` 调用 `page.screenshot()`

---

### 4.6 UI 交互层（Renderer）

- **Android**：使用 WebCodecs 解码 H.264（与 Aya 对齐）
- **HarmonyOS**：JPEG 直接 `drawImage`（与 Echo 对齐）
- **Web**：直接渲染 screenshot 或显示 DOM 结构
- **Timeline**：使用 `<t-timeline>` 展示 Agent 执行步骤（可复用 Midscene 的 dump）

---

### 4.7 Agent Loop（统一执行逻辑）

**目标：** 用 Midscene Agent 驱动所有平台。

执行循环（与 Midscene 模型一致）：

1. 获取 UIContext（截图 + DOM / XML）  
2. `Agent.aiAct()` 生成动作计划  
3. 驱动 `IDeviceAdapter.actionSpace()` 执行动作  
4. 写入 `ExecutionDump` / IPC 日志  
5. 循环直到 `finish` 或超时

---

## 5. IPC 事件规范（建议统一）

```ts
export enum IpcChannels {
  // Renderer -> Main
  START_TASK = 'task:start',      // { instruction, deviceId }
  STOP_TASK = 'task:stop',

  // Main -> Renderer
  DEVICE_UPDATE = 'device:list',  // Device[]
  TASK_LOG = 'task:log',          // { type, content }
  DEVICE_FRAME = 'device:frame',  // { deviceId, format: 'h264'|'jpeg', data: Uint8Array }
}
```

---

## 6. AI 输出格式（两种模式）

### A) Midscene 模式（推荐）

AI 输出由 Midscene 内部处理，外部无需关心具体 JSON。

### B) Open-AutoGLM 模式（用于自定义 LLM）

```text
<think>...</think>
<answer>do(action="Tap", element=[x,y])</answer>
```

关键规则（来自 Open-AutoGLM）：

- `element=[x,y]` 坐标范围 **0~1000**（相对坐标）
- `finish(message="...")` 终止任务
- `do(action="Type", text="...")` 会自动清空输入框再输入
- 遇到登录 / 验证码使用 `do(action="Take_over", message="...")`

> 如果采用 Open-AutoGLM 输出格式，需在执行层完成 **相对坐标 -> 像素坐标** 的转换。

---

## 7. 关键注意事项（来自真实代码）

1. **Scrcpy 三路 Socket 顺序不固定**，必须检测音频流 metadata。  
2. **HarmonyOS UiDriver 依赖固定版本 so**（Echo 使用 `1.1.0`）。  
3. **Midscene 会自动处理 screenshot scale**，避免 DPR 不一致。  
4. **不要把视频帧放进 Vue 响应式**，直接交给 Decoder。  
5. **打包后资源路径变化**：需用 `app.isPackaged` 动态修正 `resources/` 路径。

---

## 8. 开发执行指南（Prompt 阶段）

### 阶段一：脚手架

> "创建 Electron + Vue 3 + TypeScript 的 monorepo。配置 pnpm workspace (`apps/*`, `packages/*`)。安装 `tdesign-vue-next`, `pinia`, `@tdesign/icons-vue`。"

### 阶段二：Core 适配 Midscene

> "在 `packages/core` 中封装 Midscene `Agent`。提供 `createAgent(adapter)`，接收 `IDeviceAdapter`。"

### 阶段三：Android 驱动（Aya 风格）

> "实现 `packages/drivers/android`：主进程用 adbkit + scrcpy server；Renderer 用 `@yume-chan/scrcpy` 解码并注入触控。"

### 阶段四：HarmonyOS 驱动（Echo 风格）

> "实现 `packages/drivers/ohos`：基于 hdckit `UiDriver`，实现 `startCaptureScreen` + touchDown/Move/Up。"

### 阶段五：Web 驱动（Midscene Web）

> "实现 `packages/drivers/web`：封装 `PlaywrightAgent`，提供 `capture()`/`tap()` 等接口。"

### 阶段六：统一 Agent Loop

> "主进程实现 `AgentScheduler`：接收指令 -> AI 规划 -> 调用 Adapter -> 发送日志/帧到 UI。"

