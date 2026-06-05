# 更新日志

本文档记录项目各版本的变更。功能说明见 [MARKDOWN_DOCUMENTATION.md](./MARKDOWN_DOCUMENTATION.md) 与 [UI_DESIGN_SPECIFICATION.md](./UI_DESIGN_SPECIFICATION.md)。

---

## v2.2 (2026-06-05)

### 功能清单

| 功能         | 实现文件     | 说明                                    |
| ------------ | ------------ | --------------------------------------- |
| 消息入场动画 | chat.vue     | 用户消息从右滑入，AI 消息从左滑入       |
| 发送弹跳动画 | chat.vue     | 发送按钮点击时弹跳反馈                   |
| AI 完成动画  | chat.vue     | AI 回复完成时气泡轻微弹跳                |

### UI

- 消息入场动画：用户消息从右侧滑入（0.3s ease-out），AI 消息从左侧滑入
- 发送按钮点击弹跳：按下缩小到 0.88，回弹到 1（0.25s）
- AI 回复完成动画：气泡轻微放大到 1.04 后回弹（0.35s）

### Markdown

- 修复深色模式样式优先级：@media 块移到 CSS 末尾，确保深色覆盖生效
- 深色模式全面适配：代码块、行内代码、引用块、表格、语法高亮、LaTeX、任务列表、反馈按钮
- 修复代码块底部无边框：四角圆角 + 完整边框，清理深色模式重复样式
- 修复流式模式反馈「消息不存在」：后端 saveStreamResult 返回本地消息 ID，done 事件传递 messageId
- Markdown 排版间距参照 Typora 调整：行高 1.5，段落/代码块/引用块/表格/图片统一 16rpx，列表项 4rpx，标题 28/14rpx
- 修复空行间距叠加问题：去掉空行产生的 `<br/>`，块级元素之间靠自身 margin 统一控制节奏

---

## v2.1 (2026-06-04)

### 功能清单

| 功能           | 实现文件     | 说明                           |
| -------------- | ------------ | ------------------------------ |
| 真流式输出     | chat.js, chat.vue | SSE 流式回答，逐字出现         |
| 深色模式       | chat.vue     | 跟随系统自动切换，CSS 媒体查询适配 |
| 字体优化       | App.vue      | 中英文混排，西文优先           |
| 图片优化       | chat.vue     | 占位背景色，加载过程有视觉反馈 |

### Markdown

修改文件：

- miniapp/api/chat.js：新增 sendChatStream 函数，使用 uni.request enableChunked 接入后端 SSE 流式输出
- miniapp/api/config.js：USE_STREAM 默认值改为 true，启用真流式
- miniapp/pages/chat/chat.vue：send() 方法根据 USE_STREAM 分支，流式模式边收边显示，结束后渲染 Markdown；新增深色模式 CSS 变量覆盖与切换逻辑；图片添加占位背景

### UI

- 新增深色模式：通过 manifest.json 启用微信小程序 darkmode，CSS 使用 `@media (prefers-color-scheme: dark)` 媒体查询自动适配（变量覆盖、代码块 GitHub Dark 风格、用户气泡对比度优化），跟随系统自动切换，无需手动操作
- 字体优化：调整字体栈顺序，西文字体在前中文在后，增加 Noto Sans SC / Source Han Sans SC，行高从 1.5 调整为 1.6
- 图片优化：image-container 添加占位背景色、最小高度和边框，图片加载过程有视觉反馈

---

## v2.0 (2026-06-03)

### 功能清单

| 功能       | 实现文件     | 说明                   |
| ---------- | ------------ | ---------------------- |
| 语法高亮   | highlight.js | 支持 10+ 种语言        |
| 表格支持   | markdown.js  | 响应式设计，横向滚动   |
| 任务列表   | markdown.js  | 复选框样式，删除线效果 |
| LaTeX 公式 | latex.js     | 100+ 命令，行内/块级   |
| 图片预览   | chat.vue     | 全屏查看，缩放滑动     |

### Markdown

新增文件：

- miniapp/utils/highlight.js：词法分析器，支持 10+ 种编程语言
- miniapp/utils/latex.js：LaTeX 命令解析，支持分数、根号、上下标等，转换为 HTML 和 Unicode

修改文件：

- miniapp/utils/markdown.js：集成语法高亮与 LaTeX 公式，添加表格解析与任务列表，更新 hasMarkdown 检测
- miniapp/pages/chat/chat.vue：添加语法高亮、任务列表、LaTeX 公式样式，添加图片预览功能，rich-text 组件支持 itemclick 事件

### UI

- 重构聊天页视觉与交互，建立统一设计系统（色彩、间距、圆角、阴影、字体），设计语言参考 Linear、Notion、Stripe、Vercel
- 欢迎界面改为简洁居中布局，去除卡片容器与冗余信息
- 消息气泡区分用户/AI 样式，AI 气泡配头像，统一圆角与阴影
- 输入框与发送按钮统一高度 72rpx、圆角 24rpx，聚焦态加蓝色光晕
- 转人工栏改为单行简洁样式
- 全局触摸反馈、状态过渡与打字动画统一为 0.2s 时长

---

## v1.0 (2026-06-02)

### 功能清单

| 功能     | 说明                |
| -------- | ------------------- |
| 标题     | h1-h6，不同大小     |
| 强调文本 | 加粗、斜体、删除线  |
| 行内代码 | 红色文字，灰色背景  |
| 代码块   | 深色背景，等宽字体  |
| 列表     | 有序/无序，支持嵌套 |
| 链接     | 蓝色文字，下划线    |
| 图片     | 自适应宽度，圆角    |
| 引用     | 蓝色边框，灰色背景  |
| 分隔线   | 水平线条            |
