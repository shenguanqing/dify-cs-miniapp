# UI 设计规范

本文档定义智能客服小程序的视觉与交互设计标准，作为后续开发与维护的统一依据。设计语言参考 Linear、Notion、Stripe、Vercel，追求简洁、专业、现代、有质感。

---

## 设计系统

### 色彩系统

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
- 基础字号 28rpx，行高 1.5

---

## 组件规范

### 欢迎界面

进入会话且无历史消息时展示，采用简洁居中布局，不使用卡片容器。

- 垂直水平居中，`min-height` 约 50vh
- 标题字号 48rpx、加粗、字间距 4rpx，文案亲切（如「您好！」）
- 描述字号 30rpx、次文字色、行高 1.6
- 避免冗余信息，文案不重复

### 消息气泡

- 用户气泡（右）：主色渐变背景、白色文字、`--shadow-md`，圆角 `xl xl sm xl`
- AI 气泡（左）：次背景色、主文字色、浅边框，圆角 `xl xl xl sm`
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

```css
.sources-card {
  background: var(--color-bg);
  border: 1rpx solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.source-index {
  width: 36rpx;
  height: 36rpx;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
}
```

### 操作按钮（复制 / 点赞 / 点踩）

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
- 聚焦时边框变主色并加蓝色光晕，传达可输入状态

```css
.input-wrap {
  background: var(--color-bg);
  border: 2rpx solid var(--color-border);
  border-radius: 24rpx;
  height: 72rpx;
  transition: all 0.2s ease;
}

.input-wrap:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.1);
}
```

### 发送按钮

- 圆角 24rpx，高度 72rpx，与输入框统一
- 默认灰底，可发送时切换为主色渐变并轻微放大，点击收缩

```css
.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: var(--color-bg-tertiary);
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
}

.send-btn.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  box-shadow: var(--shadow-md);
  transform: scale(1.05);
}

.send-btn.active:active { transform: scale(0.95); }
```

### 转人工栏

- 单行简洁文字，不使用卡片样式，紧凑不占空间
- 文字弱化、链接用主色

```css
.handoff-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
}

.handoff-text { font-size: 24rpx; color: var(--color-text-tertiary); }
.handoff-link { font-size: 24rpx; color: var(--color-primary); font-weight: 600; }
```

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

### 动画

- 统一动画时长 0.2s
- 打字动画使用 `transform` 保证流畅

---

## 适配规范

### 安全区域

- 底部区域处理 `env(safe-area-inset-bottom)`
- 输入框不被系统导航栏遮挡

### 滚动

- 隐藏滚动条
- 平滑滚动，新消息自动滚动到底部

---

## 设计原则

1. **清晰的视觉层次**：消息内容最突出，辅助信息适度弱化，操作按钮不抢焦点。
2. **一致的设计语言**：色彩、间距、圆角、动画时长统一。
3. **舒适的阅读体验**：充足留白、行高 1.5、清晰文字层次、柔和配色。
4. **生动的交互反馈**：每个操作都有视觉反馈，状态变化平滑，动画不干扰操作。

---

## 技术实现要点

### CSS 变量

通过 CSS 变量集中管理设计令牌，便于维护与主题扩展：

```css
page {
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --radius-sm: 8rpx;
  /* ... */
}
```

### 渐变与阴影

```css
background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
```

### 过渡动画

```css
transition: all 0.2s ease;
transition: border-color 0.2s ease;
transition: transform 0.2s ease;
```

### Markdown 渲染注意事项

`rich-text` 组件只能渲染标准 HTML 标签（`div`、`p`、`span`、`strong`、`em`、`del`、`ul`、`ol`、`li`、`table` 等），不能使用 `view`/`text` 等小程序组件标签。样式统一使用 class 选择器（避免页面级 style 的标签选择器警告），元素本身使用标准 HTML 标签以保证 `rich-text` 正确渲染。

---

## 设计参考

- **Linear**（https://linear.app）— 简洁、专业、高效
- **Notion**（https://notion.so）— 清晰、舒适、有层次
- **Stripe**（https://stripe.com）— 精致、现代、有质感
- **Vercel**（https://vercel.com）— 简约、大气、专业

---

**设计参考**：Linear + Notion + Stripe + Vercel

版本变更记录见 [CHANGELOG.md](./CHANGELOG.md)。
