# Markdown 功能说明

智能客服助手的回复支持完整的 Markdown 格式渲染，可以显示丰富格式的内容。

---

## 支持的语法

### 1. 标题

```
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

效果：

- 一级标题：36rpx，加粗
- 二级标题：32rpx，加粗
- 三级标题：30rpx，加粗
- 四级标题：28rpx，加粗
- 五级标题：26rpx，加粗
- 六级标题：24rpx，加粗

### 2. 强调文本

```
**加粗文本**
__加粗文本__

*斜体文本*
_斜体文本_

~~删除线文本~~
```

### 3. 行内代码

```
使用 `console.log()` 打印日志
```

效果：浅灰背景 + 红色文字 + 等宽字体。

### 4. 代码块（支持语法高亮）

使用三反引号包裹，并在起始反引号后标注语言名，例如：

    ```javascript
    const greeting = 'Hello, World!';
    console.log(greeting);
    
    function add(a, b) {
      return a + b;
    }
    ```

支持语言：JavaScript、TypeScript、Python、Java、HTML、CSS、SQL、Bash、JSON 等。

高亮颜色：

- 关键字：紫色（#c678dd）
- 内置函数/对象：蓝色（#61afef）
- 字符串：绿色（#98c379）
- 注释：灰色，斜体（#5c6370）
- 数字：橙色（#d19a66）
- 运算符：青色（#56b6c2）

### 5. 列表

无序列表：

```
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3
```

有序列表：

```
1. 第一步
2. 第二步
3. 第三步
```

任务列表：

```
- [x] 完成需求分析
- [x] 设计数据库
- [ ] 开发前端
- [ ] 开发后端
- [ ] 测试和部署
```

### 6. 链接和图片

链接：

```
[链接文本](https://example.com)
```

图片：

```
![替代文本](https://example.com/image.png)
```

图片预览功能：点击图片全屏查看，支持缩放和滑动，自动收集当前会话中所有图片。

### 7. 引用

```
> 这是一段引用文本
> 可以多行
```

效果：左侧蓝色边框 + 浅蓝背景 + 斜体文字。

### 8. 分隔线

```
---
```

### 9. 表格

```
| 功能 | 语法       | 示例   |
| ---- | ---------- | ------ |
| 加粗 | **text**   | 粗体   |
| 斜体 | *text*     | 斜体   |
| 代码 | `code`     | code   |
```

特性：自动识别表头和分隔行，响应式设计支持横向滚动，表头有背景色并加粗显示，悬停行高亮。

---

## 高级功能

### 1. LaTeX 数学公式

行内公式：

```
勾股定理：$a^2 + b^2 = c^2$
```

块级公式：

```
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

支持的功能：

希腊字母：

- α, β, γ, δ, ε, ζ, η, θ, ι, κ, λ, μ, ν, ξ, π, ρ, σ, τ, υ, φ, χ, ψ, ω
- Α, Β, Γ, Δ, Ε, Ζ, Η, Θ, Ι, Κ, Λ, Μ, Ν, Ξ, Π, Ρ, Σ, Τ, Υ, Φ, Χ, Ψ, Ω

数学符号：

- 运算符：±, ∓, ×, ÷, ·, ∗, ∘, •
- 关系符：≤, ≥, ≠, ≈, ≡, ∼, ≃, ≅, ∝, ⊥, ∥
- 集合符：∈, ∉, ⊂, ⊃, ⊆, ⊇, ∪, ∩, ∅
- 逻辑符：∀, ∃, →, ←, ⇒, ⇐, ↔, ⇔, ↑, ↓
- 积分符：∫, ∬, ∭, ∮, ∑, ∏, ∐
- 其他：∞, ∂, ∇, √, ∠, △, □, ○, ◇

上下标：

```
$x^2$       上标
$x_i$       下标
$x^{2y}$    多字符上标
$x_{i,j}$   多字符下标
```

分数：

```
$\frac{a}{b}$
```

根号：

```
$\sqrt{x}$
$\sqrt[3]{x}$
```

重音符号：

```
$\hat{x}$     帽
$\bar{x}$     横线
$\vec{x}$     向量
$\dot{x}$     点
$\ddot{x}$    双点
$\tilde{x}$   波浪线
```

数学函数：

```
$\sin(x)$
$\cos(x)$
$\tan(x)$
$\log(x)$
$\ln(x)$
$\lim_{x \to 0}$
```

特殊符号：

- 集合：ℝ, ℤ, ℕ, ℚ, ℂ
- 其他：∴, ∵, …, ⋯, ⋮, ′, †, ‡, §, ©, ¶

### 2. 语法高亮

支持以下编程语言：

| 语言       | 文件扩展名  | 支持程度 |
| ---------- | ----------- | -------- |
| JavaScript | .js, .jsx   | 完整     |
| TypeScript | .ts, .tsx   | 完整     |
| Python     | .py         | 完整     |
| Java       | .java       | 完整     |
| HTML       | .html, .htm | 完整     |
| CSS        | .css, .scss | 完整     |
| SQL        | .sql        | 完整     |
| Bash       | .sh, .bash  | 完整     |
| JSON       | .json       | 完整     |
| C/C++      | .c, .cpp    | 基础     |
| Go         | .go         | 基础     |
| Rust       | .rs         | 基础     |
| Ruby       | .rb         | 基础     |
| PHP        | .php        | 基础     |
| Swift      | .swift      | 基础     |
| Kotlin     | .kt         | 基础     |

### 3. 图片预览

功能特性：点击图片全屏查看，支持双指缩放，支持左右滑动切换图片，自动收集当前会话中所有图片，图片显示可点击样式，点击时有视觉反馈（透明度变化）。

使用方式：

```
![图片描述](https://example.com/image.png)
```

点击图片即可全屏预览。

---

## 样式特点

### 色彩方案

主色调：

- 主色：蓝色（#2563eb）
- 浅主色：蓝色（#3b82f6）
- 背景色：白色（#ffffff）
- 次背景：浅灰（#f8fafc）
- 三级背景：灰色（#f1f5f9）

文字颜色：

- 主文字：深灰（#0f172a）
- 次文字：中灰（#475569）
- 三级文字：浅灰（#94a3b8）

边框颜色：

- 主边框：灰色（#e2e8f0）
- 浅边框：浅灰（#f1f5f9）

### 字体方案

正文字体：

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
Helvetica, Arial, sans-serif
```

代码字体：

```
'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace
```

公式字体：

```
'Times New Roman', 'Georgia', serif
```

### 间距系统

- 段落间距：16rpx
- 标题间距：24rpx（上），12rpx（下）
- 列表间距：12rpx（外），8rpx（内）
- 代码块间距：16rpx
- 表格间距：16rpx

### 圆角系统

- 小圆角：8rpx（代码块、标签）
- 中圆角：12rpx（卡片）
- 大圆角：16rpx（弹窗）
- 超大圆角：20rpx（气泡）
- 全圆角：9999rpx（按钮、头像）

---

## 使用示例

以下示例展示 AI 回复中常见的内容组合。

### 示例 1：功能清单

```
## 产品特性

### 核心功能

- [x] 智能问答：基于 AI 大模型
- [x] 知识库管理：支持多种文档格式
- [ ] 数据分析：实时统计用户反馈
- [ ] 多轮对话：上下文记忆

### 技术架构

| 组件   | 技术       | 版本 |
| ------ | ---------- | ---- |
| 前端   | Vue.js     | 3.x  |
| 后端   | Node.js    | 18.x |
| 数据库 | PostgreSQL | 15   |
| 缓存   | Redis      | 7.x  |
```

### 示例 2：数学公式

```
## 数学公式示例

二次方程求根公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

欧拉公式：

$$
e^{i\pi} + 1 = 0
$$

勾股定理：$a^2 + b^2 = c^2$
```

### 示例 3：问题解答

```
## 常见问题

Q: 如何重置密码？

A: 请按以下步骤操作：

1. 点击登录页面的「忘记密码」
2. 输入注册邮箱
3. 查收重置邮件
4. 点击邮件中的链接
5. 设置新密码

如果仍有问题，请联系客服。
```

---

## 技术实现

### 文件结构

```
miniapp/
├── utils/
│   ├── markdown.js      Markdown 解析器（核心）
│   ├── highlight.js     语法高亮器
│   └── latex.js         LaTeX 公式解析器
└── pages/
    └── chat/
        └── chat.vue     聊天页面（包含样式）
```

### 核心函数

markdown.js：

```javascript
markdownToHtml(markdown)              // 将 Markdown 转换为 HTML
hasMarkdown(text)                     // 检测是否包含 Markdown 语法
parseInline(text)                     // 解析行内格式
parseBlock(text)                      // 解析块级元素
parseTable(lines, startIndex)         // 解析表格
parseCodeBlock(text)                  // 解析代码块
restoreCodeBlocks(html, codeBlocks)   // 还原代码块（带语法高亮）
```

highlight.js：

```javascript
highlightCode(code, lang)             // 对代码进行语法高亮
```

latex.js：

```javascript
latexToHtml(latex)                    // 将 LaTeX 公式转换为 HTML
hasLatex(text)                        // 检测是否包含 LaTeX 公式
```

### 渲染流程

1. 用户输入，发送到后端
2. 后端返回原始 Markdown 文本
3. 前端打字动画显示纯文本
4. 打字完成后调用 renderMarkdown()
5. 调用 markdownToHtml() 转换为 HTML
6. 使用 rich-text 组件渲染 HTML
7. 用户可以交互（点击图片、复制内容等）

### 样式实现

语法高亮：

```css
.hl-keyword { color: #c678dd; font-weight: 600; }
.hl-builtin { color: #61afef; }
.hl-string { color: #98c379; }
.hl-comment { color: #5c6370; font-style: italic; }
.hl-number { color: #d19a66; }
.hl-operator { color: #56b6c2; }
.hl-punctuation { color: #abb2bf; }
```

任务列表：

```css
.task-checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid var(--color-border);
  border-radius: 6rpx;
}

.task-checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
```

LaTeX 公式：

```css
.latex-inline {
  padding: 2rpx 6rpx;
  background: rgba(37, 99, 235, 0.05);
  border-radius: 4rpx;
  font-family: 'Times New Roman', serif;
  font-style: italic;
}

.latex-block {
  padding: 20rpx 24rpx;
  margin: 16rpx 0;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
}
```

### 渲染标签约定

rich-text 组件只能渲染标准 HTML 标签（div、p、span、strong、em、del、ul、ol、li、table、thead、tbody、tr、th、td、code、pre、h1-h6、blockquote、hr、br、a、img 等），不能使用 view、text 等小程序组件标签。元素使用标准 HTML 标签以保证 rich-text 正确渲染，样式统一使用 class 选择器，避免页面级 style 的标签选择器警告。

---

## 已知限制

### 1. LaTeX 公式

- 不支持复杂的多行公式对齐
- 矩阵支持有限
- 某些特殊符号可能无法正确显示
- 已支持 100+ 常用 LaTeX 命令，建议公式不要太复杂

### 2. 语法高亮

- 不支持所有编程语言
- 高亮规则相对简单，可能不完全准确
- 已支持 10+ 种主流语言，对未知语言默认使用 JavaScript 高亮

### 3. 流程图

- 暂未实现 Mermaid 图表，受限于微信小程序环境，建议使用图片替代

### 4. 图片预览

- 依赖 rich-text 的 itemclick 事件，某些情况下可能无法触发
- 外部图片可能受防盗链影响

### 5. 链接

- 小程序中无法跳转外部链接，可以显示链接文本但无法点击

### 6. 复制功能

- 点击复制按钮复制原始 Markdown 文本，而非渲染后的 HTML，方便粘贴到其他 Markdown 编辑器

---

## 性能优化

- 打字动画期间：显示纯文本，不解析 Markdown，避免频繁的 DOM 更新
- 打字完成后：一次性渲染 Markdown，预渲染并存储结果
- 长文本处理：代码块自动换行，表格支持横向滚动，避免布局抖动

---

## 兼容性

微信小程序：支持基础库 2.x+，使用 rich-text 组件渲染，部分高级特性可能受限。

uni-app：完全兼容，使用 ES6 模块语法，遵循 uni-app 规范。

---

## 参考资源

- [Markdown 官方语法](https://www.markdownguide.org/basic-syntax/)
- [CommonMark 规范](https://commonmark.org/)
- [LaTeX 数学符号](https://www.overleaf.com/learn/latex/Mathematical_expressions)
- [微信小程序 rich-text 组件](https://developers.weixin.qq.com/miniprogram/dev/component/rich-text.html)
- [uni-app rich-text 组件](https://uniapp.dcloud.net.cn/component/rich-text.html)

---

版本变更记录见 [CHANGELOG.md](./CHANGELOG.md)。
