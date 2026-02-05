# Omni Controller UI 设计文档

## 1. 设计目标

将 Midscene 分散的 UI 组件（Report、Playground、Recorder、Chrome Extension）整合为一个统一的桌面客户端，支持多设备管理和完整的 AI 自动化工作流。

## 2. 核心设计原则

### 2.1 统一性
- 遵循 Midscene 现有的视觉设计语言和交互模式
- 复用 `@midscene/visualizer` 组件库
- 保持暗黑/明亮主题一致性

### 2.2 模块化
- 各功能模块独立但可无缝切换
- 支持插件化扩展新设备类型
- 状态管理清晰分离

### 2.3 效率优先
- IDE 式布局，最大化工作区
- 可折叠/展开的侧边栏
- 快捷键支持

## 3. 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│  Omni Controller                                                │
│  ┌──────────┬──────────────────────────────┬─────────────────┐  │
│  │          │                              │                 │  │
│  │  Device  │      Main Content Area       │   Inspector     │  │
│  │  Panel   │                              │   Panel         │  │
│  │  (Left)  │                              │   (Right)       │  │
│  │          │                              │                 │  │
│  │  - Web   │   ┌──────────────────────┐   │  - Properties   │  │
│  │  - iOS   │   │                      │   │  - Timeline     │  │
│  │  - Andr  │   │   Workspace          │   │  - Details      │  │
│  │  - Comp  │   │                      │   │                 │  │
│  │          │   │   [Playground/       │   │                 │  │
│  │          │   │    Report/           │   │                 │  │
│  │          │   │    Recorder]         │   │                 │  │
│  │          │   │                      │   │                 │  │
│  │          │   └──────────────────────┘   │                 │  │
│  │          │                              │                 │  │
│  └──────────┴──────────────────────────────┴─────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Status Bar                                               │ │
│  │  - Connection Status | Device Info | Model | Task Count   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 模块详细设计

### 4.1 设备面板（Device Panel）- 左侧

**功能**：管理和切换不同的设备连接

```typescript
interface DevicePanelProps {
  devices: Device[];
  activeDeviceId: string;
  onDeviceSelect: (deviceId: string) => void;
  onDeviceConnect: (device: DeviceConfig) => void;
  onDeviceDisconnect: (deviceId: string) => void;
}

type DeviceType = 'web' | 'android' | 'ios' | 'computer';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: 'connected' | 'disconnected' | 'connecting';
  metadata: {
    url?: string;           // Web
    udid?: string;          // iOS/Android
    model?: string;         // Device model
    osVersion?: string;     // OS version
    screenshot?: string;    // Last screenshot thumbnail
  };
}
```

**UI 组件**：
- 设备列表（可折叠分组）
- 设备状态指示器（在线/离线/连接中）
- 快速操作按钮（连接/断开/截图）
- 设备缩略图预览
- 添加新设备按钮

**交互**：
- 点击设备切换当前工作区
- 拖拽调整面板宽度
- 右键菜单：重命名、配置、删除

### 4.2 主工作区（Main Workspace）- 中间

根据当前模式显示不同内容：

#### 模式 A: Playground 模式（默认）
用于与设备进行对话式交互

```
┌─────────────────────────────────────┐
│  Toolbar                             │
│  [Env Config] [Clear] [Settings]    │
├─────────────────────────────────────┤
│                                      │
│  Chat Interface                      │
│  ┌──────────────────────────────┐   │
│  │ User: 点击登录按钮           │   │
│  │                              │   │
│  │ AI:   [执行中...]            │   │
│  │       Screenshot result      │   │
│  │                              │   │
│  │ User: 输入用户名 admin       │   │
│  │ ...                          │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ [Input...]        [Send]     │   │
│  └──────────────────────────────┘   │
│                                      │
└─────────────────────────────────────┘
```

**复用组件**：
- `UniversalPlayground` - 对话界面
- `PromptInput` - 输入框
- `PlaygroundResult` - 结果展示
- `ContextPreview` - 上下文预览

#### 模式 B: Report 模式
用于查看执行历史报告

```
┌─────────────────────────────────────┐
│  Timeline                            │
│  ○───○───●───○───○                   │
│  点击  输入  断言  滚动  完成        │
├─────────────────────────────────────┤
│                                      │
│  Detail Panel                        │
│  ┌──────────────────────────────┐   │
│  │ Screenshot                   │   │
│  │                              │   │
│  │ [Highlighted Elements]       │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ AI Thought Process           │   │
│  │ Action: click                │   │
│  │ Target: Login Button         │   │
│  │ Reason: ...                  │   │
│  └──────────────────────────────┘   │
│                                      │
└─────────────────────────────────────┘
```

**复用组件**：
- `Timeline` - 时间线
- `DetailPanel` - 详情面板
- `Player` - 回放播放器

#### 模式 C: Recorder 模式
用于录制和生成测试脚本

```
┌─────────────────────────────────────┐
│  Recording Controls                  │
│  [● Record] [⏸ Pause] [■ Stop]     │
├─────────────────────────────────────┤
│                                      │
│  Session List                        │
│  ┌──────────────────────────────┐   │
│  │ 📝 Test Login Flow           │   │
│  │    12 actions | 2:34         │   │
│  │    [Play] [Export] [Edit]    │   │
│  │                              │   │
│  │ 📝 Search Product            │   │
│  │    8 actions | 1:45          │   │
│  └──────────────────────────────┘   │
│                                      │
│  Export Options                      │
│  [YAML] [Playwright] [Puppeteer]    │
│                                      │
└─────────────────────────────────────┘
```

**复用组件**：
- `RecordList` - 录制列表
- `ProgressModal` - 进度弹窗
- `SessionModals` - 会话管理

### 4.3 检查器面板（Inspector Panel）- 右侧

**功能**：显示当前上下文信息和操作详情

```typescript
interface InspectorPanelProps {
  mode: 'playground' | 'report' | 'recorder';
  context?: UIContext;
  selectedTask?: ExecutionTask;
  deviceInfo?: DeviceInfo;
}
```

**内容根据模式变化**：

**Playground 模式**：
- 当前截图（实时预览）
- 设备信息（分辨率、DPI）
- 模型配置（当前使用的 AI 模型）
- 快捷操作（截图、刷新）

**Report 模式**：
- 任务详情（选中的任务）
- 元素定位信息
- AI 响应原始数据
- Token 使用统计

**Recorder 模式**：
- 录制状态
- 当前操作计数
- 生成的代码预览

### 4.4 状态栏（Status Bar）- 底部

```
┌─────────────────────────────────────────────────────────────────┐
│ 🟢 Connected | iPhone 15 Pro | iOS 17.1 | 393×852 @3x | GPT-4o │
│                                                 3 tasks pending │
└─────────────────────────────────────────────────────────────────┘
```

**显示信息**：
- 连接状态（在线/离线）
- 当前设备名称和类型
- 设备规格（分辨率、OS 版本）
- 当前 AI 模型
- 待处理任务数
- 网络延迟（可选）

## 5. 状态管理设计

```typescript
// 全局状态
interface OmniControllerState {
  // 设备管理
  devices: Device[];
  activeDeviceId: string | null;
  
  // 视图模式
  mode: 'playground' | 'report' | 'recorder';
  
  // UI 状态
  sidebarCollapsed: boolean;
  inspectorCollapsed: boolean;
  theme: 'dark' | 'light';
  
  // Playground 状态
  playgroundState: PlaygroundState;
  
  // Report 状态
  selectedExecutionId: string | null;
  selectedTaskId: string | null;
  
  // Recorder 状态
  recordingState: RecordingState;
}

// 使用 Zustand 或 Redux 进行状态管理
```

## 6. 路由设计

```typescript
// 使用 React Router 或类似方案
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'playground/:deviceId', element: <PlaygroundView /> },
      { path: 'report/:executionId', element: <ReportView /> },
      { path: 'recorder', element: <RecorderView /> },
      { path: 'settings', element: <SettingsView /> },
    ],
  },
];
```

## 7. 技术栈

- **Framework**: Electron + React + TypeScript
- **UI Library**: Ant Design (与 Midscene 保持一致)
- **Component Library**: `@midscene/visualizer` (复用)
- **State Management**: Zustand
- **Styling**: Less + CSS Modules
- **Layout**: `react-resizable-panels`
- **Theme**: CSS Variables + Ant Design Theme

## 8. 组件复用清单

### 8.1 直接复用（来自 @midscene/visualizer）
- ✅ `Logo`
- ✅ `UniversalPlayground`
- ✅ `ScreenshotViewer`
- ✅ `Player`
- ✅ `NavActions`
- ✅ `PromptInput`
- ✅ `PlaygroundResult`
- ✅ `ContextPreview`
- ✅ `ConfigSelector`
- ✅ `EnvConfig`
- ✅ `HistorySelector`
- ✅ `globalThemeConfig`
- ✅ `useGlobalPreference`

### 8.2 适配改造（来自 apps/report）
- 🔧 `Sidebar` → 通用化设备列表
- 🔧 `Timeline` → 保持现有功能
- 🔧 `DetailPanel` → 增强多设备支持
- 🔧 `DetailSide` → 整合 Inspector

### 8.3 适配改造（来自 apps/chrome-extension）
- 🔧 `Recorder` → 集成到主界面
- 🔧 `RecordList` → 统一风格
- 🔧 `SessionModals` → 复用弹窗逻辑

## 9. 文件结构

```
omni-controller/
├── apps/
│   └── desktop-react/         # Electron 主应用
│       ├── electron/          # Electron main/preload/IPC
│       ├── src/               # 渲染进程 (React)
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx
│       │   │   ├── DevicePanel.tsx
│       │   │   ├── InspectorPanel.tsx
│       │   │   └── StatusBar.tsx
│       │   ├── views/
│       │   │   ├── PlaygroundView.tsx
│       │   │   ├── ReportView.tsx
│       │   │   └── RecorderView.tsx
│       │   ├── components/
│       │   ├── store/
│       │   ├── types/
│       │   └── App.tsx
│       └── package.json
├── packages/
│   └── ui/                    # 共享 UI 组件（可选）
└── package.json
```

## 10. 多设备管理设计

### 10.1 设备连接管理器

```typescript
class DeviceManager extends EventEmitter {
  private devices: Map<string, DeviceConnection>;
  
  // 连接设备
  async connectWeb(url: string): Promise<Device>;
  async connectAndroid(udid: string): Promise<Device>;
  async connectIOS(udid: string): Promise<Device>;
  async connectComputer(): Promise<Device>;
  
  // 断开连接
  async disconnect(deviceId: string): Promise<void>;
  
  // 获取设备列表
  getDevices(): Device[];
  getActiveDevice(): Device | null;
  
  // 事件
  on('deviceConnected', (device: Device) => void);
  on('deviceDisconnected', (deviceId: string) => void);
  on('screenshotUpdated', (deviceId: string, screenshot: string) => void);
}
```

### 10.2 设备适配器模式

```typescript
interface DeviceAdapter {
  type: DeviceType;
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  getScreenshot(): Promise<string>;
  execute(action: DeviceAction): Promise<any>;
  getInterfaceInfo(): Promise<InterfaceInfo>;
}

// 各设备类型适配器
class WebDeviceAdapter implements DeviceAdapter { }
class AndroidDeviceAdapter implements DeviceAdapter { }
class IOSDeviceAdapter implements DeviceAdapter { }
class ComputerDeviceAdapter implements DeviceAdapter { }
```

## 11. 主题设计

复用 Midscene 的主题变量：

```less
// themes/dark.less
:root[data-theme='dark'] {
  --omni-bg-primary: #1a1a1a;
  --omni-bg-secondary: #252525;
  --omni-bg-tertiary: #2d2d2d;
  --omni-text-primary: #ffffff;
  --omni-text-secondary: #a0a0a0;
  --omni-border-color: #3d3d3d;
  --omni-accent-color: #1890ff;
  --omni-success-color: #52c41a;
  --omni-warning-color: #faad14;
  --omni-error-color: #f5222d;
}

// themes/light.less
:root[data-theme='light'] {
  --omni-bg-primary: #ffffff;
  --omni-bg-secondary: #f5f5f5;
  --omni-bg-tertiary: #fafafa;
  --omni-text-primary: #000000;
  --omni-text-secondary: #666666;
  --omni-border-color: #e8e8e8;
  --omni-accent-color: #1890ff;
  --omni-success-color: #52c41a;
  --omni-warning-color: #faad14;
  --omni-error-color: #f5222d;
}
```

## 12. 快捷键设计

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + 1` | 切换到 Playground |
| `Ctrl/Cmd + 2` | 切换到 Report |
| `Ctrl/Cmd + 3` | 切换到 Recorder |
| `Ctrl/Cmd + B` | 切换左侧设备面板 |
| `Ctrl/Cmd + I` | 切换右侧检查器面板 |
| `Ctrl/Cmd + +` | 放大截图 |
| `Ctrl/Cmd + -` | 缩小截图 |
| `Ctrl/Cmd + 0` | 重置截图缩放 |
| `Ctrl/Cmd + Shift + C` | 连接新设备 |
| `Ctrl/Cmd + Shift + D` | 断开当前设备 |
| `Ctrl/Cmd + Enter` | 发送消息（Playground） |
| `Ctrl/Cmd + R` | 开始/停止录制 |

## 13. 实现路线图

### Phase 1: 基础架构
- [ ] 搭建 Electron + React 项目结构
- [ ] 集成 `@midscene/visualizer`
- [ ] 实现基础布局和主题系统
- [ ] 实现设备管理器框架

### Phase 2: 核心功能
- [ ] 实现 Web 设备支持
- [ ] 集成 Playground 视图
- [ ] 集成 Report 视图
- [ ] 实现多设备切换

### Phase 3: 扩展功能
- [ ] 实现 Android 设备支持
- [ ] 实现 iOS 设备支持
- [ ] 集成 Recorder 功能
- [ ] 快捷键支持

### Phase 4: 优化完善
- [ ] 性能优化
- [ ] 错误处理
- [ ] 用户引导
- [ ] 文档完善

## 14. 参考资源

- Midscene Visualizer: `references/midscene/packages/visualizer`
- Midscene Report App: `references/midscene/apps/report`
- Midscene Playground: `references/midscene/apps/playground`
- Midscene Chrome Extension: `references/midscene/apps/chrome-extension`
