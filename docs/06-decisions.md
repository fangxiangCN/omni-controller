# 06 设计决策记录

日期: 2026-02-05

DD-001: AI 输出格式
- 决策: 只支持 Midscene 模式
- 原因: 统一执行链路, 复用 Agent/TaskExecutor, 减少自定义解析成本

DD-002: Android 驱动选型
- 决策: adbkit + scrcpy + @yume-chan/scrcpy
- 原因: 与 Aya 参考实现保持一致, 生态成熟

DD-003: HarmonyOS 驱动选型
- 决策: hdckit + UiDriver + uitest_agent_v1.1.0.so
- 原因: 与 Echo 参考实现保持一致, 已验证屏幕流与输入链路

DD-004: Web 驱动选型
- 决策: Playwright + 自研 Web Adapter（接口对齐 midscene）
- 原因: 参考 Midscene 设计，但不依赖其包

DD-005: Midscene Core 引入方式
- 决策: 不引入外部 @midscene/core, 将 references/midscene 的 core/shared 代码融合进 `@omni/core-runtime`/`@omni/shared-runtime` 与 `@omni/core-types`/`@omni/shared-types`
- 原因: 减少外部依赖, 保证源码可控与离线可用

DD-006: Runtime/Types 分离 + IPC 边界
- 决策: Node 能力仅存在于 `@omni/*-runtime` 与 `@omni/ipc-main`，Renderer 仅使用 UI/Types 与 `@omni/ipc-client`
- 原因: 杜绝 renderer 引入 node:* 导致的打包问题，形成可维护的边界与依赖约束
