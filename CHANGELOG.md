# 更新日志

本文档记录项目各版本的变更。功能说明见 [MARKDOWN_DOCUMENTATION.md](./MARKDOWN_DOCUMENTATION.md) 与 [UI_DESIGN_SPECIFICATION.md](./UI_DESIGN_SPECIFICATION.md)。

---

## v2.5 (2026-06-09)

### 功能清单

| 功能 | 实现文件 | 说明 |
| ---- | -------- | ---- |
| 流式实时 Markdown 渲染 | chat.vue | 流式模式下边收边解析渲染 Markdown，不再等回答结束才格式化 |
| 原生文本复制 | chat.vue | 用户消息支持长按框选；AI 回复长按整条复制 |

### 对话体验

- 流式模式改为**实时渲染 Markdown**：`onChunk` 边接收边解析片段（约每 120ms 节流一次，避免频繁重排），结束时再做一次完整渲染保证准确
- 渲染条件由 `m.typing` 改为「解析出片段即渲染」，首包到达前显示纯文本占位，打字指示器在输出期间照常显示
- 未闭合语法（如进行中的代码块/加粗）按 Markdown 规则先以纯文本显示，闭合后自动转为格式化样式

### 复制与选择

- 用户气泡与流式纯文本占位的 `<text>` 加 `user-select`，支持原生长按框选 + 系统「复制」菜单
- AI 回复气泡新增 `@longpress` 长按复制整条内容（`rich-text` 不支持逐字选择，故整条复制）；代码块仍保留独立「复制」按钮
- `copyText` 增加空内容守卫，避免长按流式中/空气泡误触

---

## v2.4 (2026-06-08)

### 功能清单

| 功能 | 实现文件 | 说明 |
| ---- | -------- | ---- |
| 代码块复制按钮 | markdown.js, chat.vue | 每个代码块头部新增「复制」按钮，可一键复制原始代码 |
| 嵌套代码围栏修复 | markdown.js | 支持 3 个及以上反引号围栏，修复 4 反引号包裹的代码演示内容泄漏 |
| 启用组件按需注入 | manifest.json | 配置 `lazyCodeLoading`，通过开发者工具上传时的代码质量检测项 |

### Markdown 代码块复制

- 新增 `markdownToSegments()`：将 AI 回答按原始顺序拆为「文本」与「代码块」两类片段
- 文本片段仍走 `rich-text` 渲染，代码块改用原生组件渲染，从而能挂载可点击的「复制」按钮（`rich-text` 内部节点无法绑定事件）
- 代码块头部展示语言标签 + 「复制」按钮，点击调用 `uni.setClipboardData` 并提示「代码已复制」
- 代码区用 `scroll-view` 横向滚动包裹，复制按钮新增浅/深色样式与点击缩放反馈
- 保留原始缩进与换行（用 `replace(/\n$/, '')` 替代 `trim()`），复制内容与源码一致

### Markdown 解析修复

- 代码围栏改用变长反引号匹配，支持 3 个及以上反引号，闭合围栏数量需与开围栏一致（CommonMark 规则）；修复以 4 反引号包裹、内部含三反引号代码块的「代码演示」被提前截断、后续内容漏出为普通段落的问题

### 构建与上传

- `manifest.json` 新增 `mp-weixin.lazyCodeLoading = "requiredComponents"`，开启「组件按需注入（用时注入）」，修复微信开发者工具上传时「代码包-组件-启用组件按需注入」未通过的问题；编译后会写入 `app.json`

---

## v2.3 (2026-06-05)

### 功能清单

| 功能 | 实现文件 | 说明 |
| ---- | -------- | ---- |
| 小程序深色主题配置 | manifest.json, pages.json, theme.json | 原生导航栏、状态栏、页面背景跟随系统深色模式 |
| iOS 风格深色 UI | App.vue, chat.vue | 黑灰底色，用户气泡、AI 头像和发送按钮保留蓝色渐变 |
| Markdown 代码块修复 | markdown.js | 修复代码块占位符泄漏为 `_CODEBLOCK..._` 的问题 |
| 双反引号行内代码修复 | markdown.js | 支持多反引号定界的行内代码 |
| 引用来源修复 | dify.client.ts, ai.service.ts, ai.controller.ts, chat.js | 兼容 Dify 多种结构提取检索资源，流式模式补齐来源 |
| 引用来源 UI 重做 | chat.vue | 改为文件卡片样式，同名来源去重 |
| 生产环境配置 | config.js, manifest.json | 填入正式 AppID 与生产域名，关闭开发模式 |
| 设计规范同步 | UI_DESIGN_SPECIFICATION.md | 更新深色模式色彩、气泡与组件规范 |

### UI

- 新增 `theme.json`，并在 `manifest.json` 中配置 `mp-weixin.themeLocation`，修复深色模式下状态栏、小程序原生导航栏仍为白色的问题
- `pages.json` 中导航栏背景、文字样式、页面背景改为主题变量，支持微信小程序按系统主题自动切换
- 深色模式底色调整为 iOS Dark Mode 风格黑灰体系：页面 `#000000`，次背景 `#1c1c1e`，三级背景 `#2c2c2e`
- 深色模式下右侧用户气泡保持浅色模式同款蓝色渐变 `#2563eb` → `#3b82f6`
- 深色模式下左侧 AI 气泡本体保持黑灰背景，仅 AI 头像保留蓝色渐变
- 深色模式下发送按钮可用态保留蓝色渐变，输入框聚焦态改为白色透明弱光晕
- 深色模式下代码块、行内代码、引用块、表格、LaTeX、弹窗统一调整为黑灰风格

### Markdown

- 修复代码块渲染异常：避免代码块被显示成 `_CODEBLOCK..._` 中间占位符
- 将代码块占位符从双下划线格式改为 `@@CODE_BLOCK_n@@`，避免被加粗/斜体等行内 Markdown 规则误伤
- 行内代码支持多反引号定界（如双反引号包裹含单反引号的内容），并按 CommonMark 规则去掉首尾各一个空格；修复双反引号行内代码渲染成空方框的问题
- 排版间距参照 Typora 调整：行高 1.5，段落/代码块/引用块/表格/图片统一 16rpx，标题 28/14rpx，列表项 4rpx
- 修复空行间距叠加：去掉空行产生的 `<br/>`，块级元素之间靠自身 margin 控制节奏

### 配置

- `config.js`：`isDev` 改为 `false`，生产域名填入实际地址
- `manifest.json`：填入正式 `appid`，新增 `themeLocation` 指向 `theme.json`

### 引用来源

- 修复引用来源不显示：`extractRetrieverResources` 兼容 Dify Chat/Workflow/Chatflow 多种数据结构（7 个候选路径）
- 流式模式补齐来源：SSE 每个事件收集检索资源，落库并通过 done 事件下发前端
- `formatSources` 统一格式化，兼容 `document_name`/`title`/`metadata.document_name` 等多种字段名，历史消息也带上来源
- UI 重做：从列表式改为文件卡片样式（浅灰底 + 圆角），同名来源去重只显示一个
- 位置调整：引用来源移入 AI 气泡内部底部，与正文用浅分隔线隔开，连成一个整体

### 文档

- 更新 `UI_DESIGN_SPECIFICATION.md`，补充 `themeLocation` 配置说明
- 更新深色模式色彩系统与组件规范，明确黑灰底色、用户气泡蓝色、AI 头像蓝色、AI 气泡黑灰的规则

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
