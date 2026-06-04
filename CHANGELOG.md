# 更新日志

本文档记录项目各版本的变更。功能说明见 [MARKDOWN_DOCUMENTATION.md](./MARKDOWN_DOCUMENTATION.md) 与 [UI_DESIGN_SPECIFICATION.md](./UI_DESIGN_SPECIFICATION.md)。

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
