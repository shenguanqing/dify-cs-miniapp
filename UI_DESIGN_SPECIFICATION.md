# UI 设计规范

本文档定义智能客服小程序的视觉与交互设计标准，作为后续开发与维护的统一依据。设计语言参考 Linear、Notion、Stripe、Vercel，追求简洁、专业、现代、有质感。

---

## 设计系统

### 色彩系统

#### 浅色模式（默认）

| 类别 | 变量 | 取值 | 用途 |
|------|------|------|------|
| 主色 | `--color-primary` | `#2563eb` | 主要操作、强调 |
| 主色（浅） | `--color-primary-light` | `#3b82f6` | 渐变终点 |
| 背景 | `--color-bg` | `#ffffff` | 页面主背景 |
| 次背景 | `--color-bg-secondary` | `#f8fafc` | 次级容器 |
| 三级背景 | `--color-bg-tertiary` | `#f1f5f9` | 标签、占位 |
| 主文字 | `--color-text-primary` | `#0f172a` | 标题、正文 |
| 次文字 | `--color-text-secondary` | `#475569` | 辅助说明 |
| 三级文字 | `--color-text-tertiary` | `#94a3b8` | 占位、弱化信息 |
| 边框 | `--color-border` | `#e2e8f0` | 常规边框 |
| 浅边框 | `--color-border-light` | `#f1f5f9` | 分隔线 |
| 成功 | `--color-success` | `#10b981` | 正向反馈 |
| 错误 | `--color-error` | `#ef4444` | 负向反馈 |

主色在重要元素上以渐变呈现：`linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)`。

#### 深色模式

跟随系统自动切换，通过 `manifest.json` 中 `mp-weixin.darkmode: true` 与 `themeLocation` 启用，样式通过 `@media (prefers-color-scheme: dark)` 媒体查询适配，无需手动切换。

深色模式采用 iOS Dark Mode 风格的黑灰体系作为底色，用户气泡、AI 头像与主要发送动作保留浅色模式同款蓝色渐变，避免界面过于单调。

深色色彩变量：

| 类别 | 变量 | 深色取值 | 用途 |
|------|------|----------|------|
| 主色 | `--color-primary` | `#2563eb` | 用户气泡、AI 头像、主要操作 |
| 主色（浅） | `--color-primary-light` | `#3b82f6` | 渐变终点 |
| 背景 | `--color-bg` | `#000000` | 页面主背景 |
| 次背景 | `--color-bg-secondary` | `#1c1c1e` | 次级容器 |
| 三级背景 | `--color-bg-tertiary` | `#2c2c2e` | 标签、占位 |
| 主文字 | `--color-text-primary` | `#f5f5f7` | 标题、正文 |
| 次文字 | `--color-text-secondary` | `#98989d` | 辅助说明 |
| 三级文字 | `--color-text-tertiary` | `#636366` | 弱化信息 |
| 边框 | `--color-border` | `#38383a` | 常规边框 |
| 浅边框 | `--color-border-light` | `#2c2c2e` | 分隔线 |

深色模式下部分组件需要额外覆盖：

- 代码块：背景 `#1c1c1e`，头部 `#2c2c2e`，文字 `#f5f5f7`，边框 `#38383a`
- 行内代码：背景 `#2c2c2e`，文字 `#f5f5f7`，边框 `#38383a`
- 引用块：背景 `#1c1c1e`，左边框 `#636366`
- 表格：边框 `#38383a`，表头背景 `#1c1c1e`
- 语法高亮：关键字 `#ffffff`、内置函数 `#d1d1d6`、字符串 `#c7c7cc`、注释 `#8e8e93`、数字 `#d1d1d6`、运算符 `#ffffff`、标点 `#f5f5f7`
- 用户气泡：保持浅色模式同款蓝色渐变 `#2563eb` → `#3b82f6`
- AI 气泡：保持黑灰次背景 `#1c1c1e`、主文字色与浅边框
- AI 头像、发送按钮可用态：保持浅色模式同款蓝色渐变 `#2563eb` → `#3b82f6`
- 反馈按钮：点赞 `#0d3117` 底 `#238636` 边框，点踩 `#3d1117` 底 `#da3633` 边框
- LaTeX 公式：行内背景 `#2c2c2e`，块级背景 `#1c1c1e`

### 间距系统

统一采用 8rpx 网格：

- 紧凑：16rpx
- 标准：24rpx
- 宽松：32rpx
- 组件内边距：20rpx、24rpx

### 圆角系统

| 变量 | 取值 | 用途 |
|------|------|------|
| `--radius-sm` | 8rpx | 小元素、标签 |
| `--radius-md` | 12rpx | 中等元素、代码块 |
| `--radius-lg` | 16rpx | 卡片 |
| `--radius-xl` | 20rpx | 大气泡 |
| `--radius-full` | 9999rpx | 圆形（头像、按钮） |

### 阴影系统

| 变量 | 取值 |
|------|------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |

### 字体系统

- 正文：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`
- 代码：`'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace`
- 公式：`'Times New Roman', 'Georgia', serif`
- 基础字号 28rpx，行高 1.6

---

## 组件规范

### 欢迎界面

进入会话且无历史消息时展示，采用简洁居中布局，不使用卡片容器。

- 垂直水平居中，`min-height` 约 50vh
- 标题字号 52rpx、加粗、字间距 4rpx，文案亲切（如「您好！」）
- 描述字号 30rpx、次文字色、行高 1.6
- 避免冗余信息，文案不重复

### 消息气泡

- 用户气泡（右）：主色渐变背景、白色文字、`--shadow-md`，圆角 `xl xl sm xl`
- AI 气泡（左）：次背景色、主文字色、浅边框，圆角 `xl xl xl sm`；深色模式下气泡本体保持黑灰，仅 AI 头像保留主色渐变
- AI 气泡左侧配圆形头像，强化角色识别
- 内边距 20rpx 24rpx，行高 1.5，阅读舒适
- AI 回复打字阶段显示纯文本，完成后以 `rich-text` 渲染 Markdown

### 打字动画

三个圆点上下浮动，纯 CSS 实现：

```css
.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: var(--radius-full);
  background: var(--color-text-tertiary);
  animation: typing 1.4s infinite ease-in-out;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-8rpx); opacity: 1; }
}
```

### 引用来源卡片

- 白底、细边框、`--shadow-sm`
- 图标置于背景容器内，保持统一
- 来源序号使用圆形背景，清晰可辨

### 操作按钮（点赞 / 点踩）

- 白底 + 细边框，点击缩放反馈
- 反馈选中态用柔和色（点赞绿、点踩红）

```css
.action-btn {
  background: var(--color-bg);
  border: 1rpx solid var(--color-border);
  transition: all 0.2s ease;
}

.action-btn:active { transform: scale(0.95); }

.action-liked { background: #ecfdf5; border-color: #a7f3d0; }
.action-disliked { background: #fef2f2; border-color: #fecaca; }
```

### 输入框

- 白底 + 边框，圆角 24rpx，高度 72rpx（与发送按钮对齐）
- 聚焦时边框变主色并加弱光晕，传达可输入状态；深色模式使用白色透明光晕，不使用蓝色

### 发送按钮

- 圆角 24rpx，高度 72rpx，与输入框统一
- 默认灰底，可发送时切换为主色渐变并轻微放大，点击收缩

### 转人工栏

- 单行简洁文字，不使用卡片样式，紧凑不占空间
- 文字弱化、链接用主色

---

## 交互规范

### 触摸反馈

- 所有可点击元素具备 `:active` 状态
- 按钮点击轻微缩小（scale 0.95）
- 发送按钮可用时轻微放大（scale 1.05）

### 状态过渡

- 输入框聚焦平滑过渡边框颜色与光晕
- 发送按钮状态切换 0.2s 过渡
- 操作按钮反馈状态颜色渐变

### 微交互动画

**消息入场**：用户消息从右侧滑入（translateX 40rpx → 0），AI 消息从左侧滑入（translateX -40rpx → 0），0.3s ease-out，`animation-fill-mode: both`。

**发送按钮弹跳**：点击发送时缩小到 0.88 再回弹到 1（0.25s ease-out），仅在可发送状态（active）下触发。

**AI 回复完成**：气泡轻微放大到 1.04 再回弹（0.35s ease-out），通过 `_justFinished` 标记触发，`$forceUpdate` 确保视图更新。

---

## 适配规范

### 安全区域

- 底部区域处理 `env(safe-area-inset-bottom)`
- 输入框不被系统导航栏遮挡

### 滚动

- 隐藏滚动条
- 平滑滚动，新消息自动滚动到底部

### Markdown 渲染

- `rich-text` 组件只能渲染标准 HTML 标签（`div`、`p`、`span`、`strong`、`em`、`del`、`ul`、`ol`、`li`、`table` 等），不能使用 `view`/`text` 等小程序组件标签
- 样式统一使用 class 选择器（避免页面级 style 的标签选择器警告）
- `@media (prefers-color-scheme: dark)` 块必须放在 CSS 文件末尾，确保深色样式优先级最高

---

## 设计原则

1. **清晰的视觉层次**：消息内容最突出，辅助信息适度弱化，操作按钮不抢焦点。
2. **一致的设计语言**：色彩、间距、圆角、动画时长统一。
3. **舒适的阅读体验**：充足留白、行高 1.6、清晰文字层次、柔和配色。
4. **生动的交互反馈**：每个操作都有视觉反馈，状态变化平滑，动画不干扰操作。

---

## 设计参考

- **Linear**（https://linear.app）— 简洁、专业、高效
- **Notion**（https://notion.so）— 清晰、舒适、有层次
- **Stripe**（https://stripe.com）— 精致、现代、有质感
- **Vercel**（https://vercel.com）— 简约、大气、专业

版本变更记录见 [CHANGELOG.md](./CHANGELOG.md)。
