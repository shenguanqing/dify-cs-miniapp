/**
 * 轻量级 Markdown 解析器
 * 将 Markdown 文本转换为微信小程序 rich-text 组件支持的 HTML
 */

import { highlightCode } from './highlight';
import { latexToHtml } from './latex';

// 转义 HTML 特殊字符
function escapeHtml(text) {
  if (!text) return '';
  // 先处理占位符，避免被转义
  let result = text;
  const placeholders = [];
  result = result.replace(/(__CODE_BLOCK_\d+__)/g, (match) => {
    placeholders.push(match);
    return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });

  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 还原占位符
  placeholders.forEach((ph, idx) => {
    result = result.replace(`__PLACEHOLDER_${idx}__`, ph);
  });

  return result;
}

// 解析行内格式
function parseInline(text) {
  if (!text) return '';

  // 转义 HTML
  let html = escapeHtml(text);

  // 块级公式 $$...$$（最先处理）
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
    return `<div class="latex-block">${latexToHtml(latex)}</div>`;
  });

  // 行内公式 $...$
  html = html.replace(/\$([^$\n]+)\$/g, (match, latex) => {
    return `<span class="latex-inline">${latexToHtml(latex)}</span>`;
  });

  // 行内代码（最先处理，避免被其他规则影响）
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 加粗
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="bold">$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong class="bold">$1</strong>');

  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // 删除线
  html = html.replace(/~~([^~]+)~~/g, '<del class="strikethrough">$1</del>');

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="link" data-url="$2">$1</a>');

  // 图片（添加 data-src 用于预览）
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="image" data-src="$2"/>');

  // 换行
  html = html.replace(/\n/g, '<br/>');

  return html;
}

// 解析代码块
function parseCodeBlock(text) {
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let result = text;
  const codeBlocks = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const lang = match[1] || '';
    const code = match[2].trim();
    codeBlocks.push({
      full: match[0],
      lang: lang,
      code: code,
    });
  }

  // 替换代码块为占位符
  codeBlocks.forEach((block, index) => {
    const placeholder = `__CODE_BLOCK_${index}__`;
    result = result.replace(block.full, placeholder);
  });

  return { text: result, codeBlocks };
}

// 还原代码块
function restoreCodeBlocks(html, codeBlocks) {
  let result = html;
  codeBlocks.forEach((block, index) => {
    const placeholder = `__CODE_BLOCK_${index}__`;
    const highlightedCode = highlightCode(block.code, block.lang);
    const langLabel = block.lang ? `<div class="code-header"><span class="code-lang">${block.lang}</span></div>` : '';
    const codeHtml = `<pre class="code-block">${langLabel}<code class="code-content">${highlightedCode}</code></pre>`;
    result = result.split(placeholder).join(codeHtml);
  });
  return result;
}

// 解析列表和块级元素
function parseBlock(text) {
  const lines = text.split('\n');
  let html = '';
  let inUnorderedList = false;
  let inOrderedList = false;
  let i = 0;

  while (i < lines.length) {
    const trimmedLine = lines[i].trim();

    // 跳过代码块占位符（已经处理过）
    if (trimmedLine.match(/^__CODE_BLOCK_\d+__$/)) {
      html += trimmedLine;
      i++;
      continue;
    }

    // 检测表格（以 | 开头的行）
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      // 先关闭未关闭的列表
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }

      // 解析表格
      const tableResult = parseTable(lines, i);
      if (tableResult.html) {
        html += tableResult.html;
        i = tableResult.endIndex;
        continue;
      }
    }

    // 任务列表
    if (trimmedLine.match(/^[-*+]\s+\[[ xX]\]\s+/)) {
      if (!inUnorderedList) {
        html += '<ul class="task-list">';
        inUnorderedList = true;
      }
      const isChecked = trimmedLine.match(/^[-*+]\s+\[x\]\s+/i);
      const content = trimmedLine.replace(/^[-*+]\s+\[[ xX]\]\s+/, '');
      const checkboxClass = isChecked ? 'task-checkbox checked' : 'task-checkbox';
      html += `<li class="task-item"><span class="${checkboxClass}"></span><span class="task-content${isChecked ? ' completed' : ''}">${parseInline(content)}</span></li>`;
    }
    // 无序列表
    else if (trimmedLine.match(/^[-*+]\s+/)) {
      if (!inUnorderedList) {
        html += '<ul class="unordered-list">';
        inUnorderedList = true;
      }
      const content = trimmedLine.replace(/^[-*+]\s+/, '');
      html += `<li class="list-item">${parseInline(content)}</li>`;
    }
    // 有序列表
    else if (trimmedLine.match(/^\d+\.\s+/)) {
      if (!inOrderedList) {
        html += '<ol class="ordered-list">';
        inOrderedList = true;
      }
      const content = trimmedLine.replace(/^\d+\.\s+/, '');
      html += `<li class="list-item">${parseInline(content)}</li>`;
    }
    // 非列表项
    else {
      if (inUnorderedList) {
        html += '</ul>';
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }

      // 标题
      if (trimmedLine.startsWith('######')) {
        html += `<h6 class="heading heading-6">${parseInline(trimmedLine.replace(/^######\s+/, ''))}</h6>`;
      } else if (trimmedLine.startsWith('#####')) {
        html += `<h5 class="heading heading-5">${parseInline(trimmedLine.replace(/^#####\s+/, ''))}</h5>`;
      } else if (trimmedLine.startsWith('####')) {
        html += `<h4 class="heading heading-4">${parseInline(trimmedLine.replace(/^####\s+/, ''))}</h4>`;
      } else if (trimmedLine.startsWith('###')) {
        html += `<h3 class="heading heading-3">${parseInline(trimmedLine.replace(/^###\s+/, ''))}</h3>`;
      } else if (trimmedLine.startsWith('##')) {
        html += `<h2 class="heading heading-2">${parseInline(trimmedLine.replace(/^##\s+/, ''))}</h2>`;
      } else if (trimmedLine.startsWith('#')) {
        html += `<h1 class="heading heading-1">${parseInline(trimmedLine.replace(/^#\s+/, ''))}</h1>`;
      }
      // 分隔线
      else if (trimmedLine.match(/^[-*_]{3,}$/)) {
        html += '<hr class="divider"/>';
      }
      // 引用
      else if (trimmedLine.startsWith('>')) {
        const content = trimmedLine.replace(/^>\s*/, '');
        html += `<blockquote class="blockquote">${parseInline(content)}</blockquote>`;
      }
      // 普通段落
      else if (trimmedLine) {
        html += `<p class="paragraph">${parseInline(trimmedLine)}</p>`;
      }
      // 空行：块级元素之间靠自身 margin 控制间距，空行不再额外产生间距
      // （保留 else 分支但不输出，避免空行叠加导致间距过大）
    }

    i++;
  }

  // 关闭未关闭的列表
  if (inUnorderedList) {
    html += '</ul>';
  }
  if (inOrderedList) {
    html += '</ol>';
  }

  return html;
}

// 解析表格
function parseTable(lines, startIndex) {
  const tableLines = [];
  let i = startIndex;

  // 收集表格行
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line.startsWith('|') || !line.endsWith('|')) {
      break;
    }
    tableLines.push(line);
    i++;
  }

  // 至少需要表头和分隔行
  if (tableLines.length < 2) {
    return { html: '', endIndex: startIndex };
  }

  // 解析表头
  const headerCells = tableLines[0]
    .split('|')
    .filter((cell) => cell.trim() !== '')
    .map((cell) => cell.trim());

  // 检查分隔行（第二行应该包含 ---）
  const separatorLine = tableLines[1];
  if (!separatorLine.match(/^\|[\s-:|]+\|$/)) {
    return { html: '', endIndex: startIndex };
  }

  // 开始构建表格 HTML
  let html = '<table class="markdown-table">';

  // 表头
  html += '<thead><tr class="table-header-row">';
  headerCells.forEach((cell) => {
    html += `<th class="table-header">${parseInline(cell)}</th>`;
  });
  html += '</tr></thead>';

  // 表体
  html += '<tbody class="table-body">';
  for (let j = 2; j < tableLines.length; j++) {
    const cells = tableLines[j]
      .split('|')
      .filter((cell) => cell.trim() !== '')
      .map((cell) => cell.trim());

    html += '<tr class="table-row">';
    cells.forEach((cell) => {
      html += `<td class="table-cell">${parseInline(cell)}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody>';

  html += '</table>';

  return { html, endIndex: i };
}

/**
 * 将 Markdown 转换为 HTML 字符串
 * @param {string} markdown - Markdown 文本
 * @returns {string} - HTML 字符串
 */
export function markdownToHtml(markdown) {
  if (!markdown) return '';

  // 处理代码块
  const { text, codeBlocks } = parseCodeBlock(markdown);

  // 解析列表和块级元素
  let html = parseBlock(text);

  // 还原代码块
  html = restoreCodeBlocks(html, codeBlocks);

  return html;
}

/**
 * 检测文本是否包含 Markdown 语法
 * @param {string} text - 文本
 * @returns {boolean} - 是否包含 Markdown
 */
export function hasMarkdown(text) {
  if (!text) return false;

  const markdownPatterns = [
    /^#{1,6}\s+/m,           // 标题
    /\*\*[^*]+\*\*/,         // 加粗
    /\*[^*]+\*/,             // 斜体
    /~~[^~]+~~/,             // 删除线
    /`[^`]+`/,               // 行内代码
    /```[\s\S]*?```/,        // 代码块
    /^\s*[-*+]\s+/m,         // 无序列表
    /^\s*\d+\.\s+/m,         // 有序列表
    /\[[^\]]+\]\([^)]+\)/,   // 链接
    /!\[[^\]]*\]\([^)]+\)/,  // 图片
    /^>\s+/m,                // 引用
    /^[-*_]{3,}$/m,          // 分隔线
    /^\|.*\|$/m,             // 表格
    /^\s*[-*+]\s+\[[ xX]\]\s+/m, // 任务列表
    /\$\$[\s\S]*?\$\$/,      // 块级公式
    /\$[^$\n]+\$/,           // 行内公式
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}
