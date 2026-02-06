# 可测试版本最小验收清单

日期: 2026-02-05

目标
- 确保 Desktop React 端完整链路可运行：设备 -> 任务 -> 日志/状态 -> 报告

前置条件
- 已安装依赖（pnpm install）
- 至少一台 Android 设备可通过 adb 连接
- `.env` 中已配置可用的模型（Midscene 模式）

验收步骤
1) 启动应用
   - 命令：
     - 安装依赖：`pnpm install`
     - 启动：`pnpm --dir apps/desktop-react dev`
   - 预期：窗口启动，TitleBar/StatusBar 渲染正常

2) 设备列表与连接
   - 预期：Devices 面板显示设备列表
   - 点击设备项可切换 active 状态
   - 预期：Inspector 预览区域开始显示画面

3) 任务执行与日志
   - 输入指令并点击 Start
   - 预期：Task 状态变为 running
   - Timeline 与 Inspector Logs 有连续输出

4) 报告生成与查看
   - 任务结束后切换到 Report
   - 预期：Player 渲染报告内容
   - Report History 列表出现新记录，可点击切换

5) 报告删除
   - 点击历史记录的 Delete
   - 预期：列表移除对应项；`reports/` 中文件被删除

退出标准
- 以上步骤均通过，视为可测试版本可交付
