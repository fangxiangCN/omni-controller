# 06 设计决策记录

日期: 2026-02-02

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
- 决策: Playwright + @midscene/web-integration
- 原因: Midscene 官方集成, 与 Agent 适配良好
