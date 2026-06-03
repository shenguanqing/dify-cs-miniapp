/**
 * 轻量级 LaTeX 公式解析器
 * 将 LaTeX 数学公式转换为 HTML 或 Unicode 字符
 * 适用于微信小程序环境
 */

// LaTeX 符号映射到 Unicode
const latexSymbols = {
  // 希腊字母
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Alpha': 'Α',
  '\\Beta': 'Β',
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Epsilon': 'Ε',
  '\\Zeta': 'Ζ',
  '\\Eta': 'Η',
  '\\Theta': 'Θ',
  '\\Iota': 'Ι',
  '\\Kappa': 'Κ',
  '\\Lambda': 'Λ',
  '\\Mu': 'Μ',
  '\\Nu': 'Ν',
  '\\Xi': 'Ξ',
  '\\Pi': 'Π',
  '\\Rho': 'Ρ',
  '\\Sigma': 'Σ',
  '\\Tau': 'Τ',
  '\\Upsilon': 'Υ',
  '\\Phi': 'Φ',
  '\\Chi': 'Χ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',

  // 数学符号
  '\\infty': '∞',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\supset': '⊃',
  '\\subseteq': '⊆',
  '\\supseteq': '⊇',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\emptyset': '∅',
  '\\neg': '¬',
  '\\land': '∧',
  '\\lor': '∨',
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',
  '\\uparrow': '↑',
  '\\downarrow': '↓',
  '\\pm': '±',
  '\\mp': '∓',
  '\\times': '×',
  '\\div': '÷',
  '\\cdot': '·',
  '\\ast': '∗',
  '\\star': '⋆',
  '\\circ': '∘',
  '\\bullet': '•',
  '\\leq': '≤',
  '\\geq': '≥',
  '\\neq': '≠',
  '\\approx': '≈',
  '\\equiv': '≡',
  '\\sim': '∼',
  '\\simeq': '≃',
  '\\cong': '≅',
  '\\propto': '∝',
  '\\perp': '⊥',
  '\\parallel': '∥',
  '\\angle': '∠',
  '\\triangle': '△',
  '\\square': '□',
  '\\circle': '○',
  '\\diamond': '◇',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\coprod': '∐',
  '\\int': '∫',
  '\\iint': '∬',
  '\\iiint': '∭',
  '\\oint': '∮',
  '\\sqrt': '√',
  '\\therefore': '∴',
  '\\because': '∵',
  '\\ldots': '…',
  '\\cdots': '⋯',
  '\\vdots': '⋮',
  '\\ddots': '⋱',
  '\\prime': '′',
  '\\dagger': '†',
  '\\ddagger': '‡',
  '\\section': '§',
  '\\copyright': '©',
  '\\pilcrow': '¶',
  '\\hand': '☞',
  '\\flat': '♭',
  '\\natural': '♮',
  '\\sharp': '♯',

  // 数字和字母的花体/粗体
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{Z}': 'ℤ',
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{C}': 'ℂ',
  '\\mathbb{P}': 'ℙ',

  // 运算符
  '\\lim': 'lim',
  '\\sin': 'sin',
  '\\cos': 'cos',
  '\\tan': 'tan',
  '\\cot': 'cot',
  '\\sec': 'sec',
  '\\csc': 'csc',
  '\\arcsin': 'arcsin',
  '\\arccos': 'arccos',
  '\\arctan': 'arctan',
  '\\sinh': 'sinh',
  '\\cosh': 'cosh',
  '\\tanh': 'tanh',
  '\\log': 'log',
  '\\ln': 'ln',
  '\\exp': 'exp',
  '\\max': 'max',
  '\\min': 'min',
  '\\sup': 'sup',
  '\\inf': 'inf',
  '\\lim': 'lim',
  '\\limsup': 'lim sup',
  '\\liminf': 'lim inf',
  '\\det': 'det',
  '\\dim': 'dim',
  '\\ker': 'ker',
  '\\hom': 'hom',
  '\\arg': 'arg',
  '\\gcd': 'gcd',
  '\\deg': 'deg',
  '\\mod': 'mod',
};

// 转义 HTML 特殊字符
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 解析 LaTeX 命令
function parseCommand(latex, pos) {
  let i = pos;
  while (i < latex.length && /[a-zA-Z]/.test(latex[i])) {
    i++;
  }
  const command = latex.slice(pos, i);

  // 检查是否是已知符号
  const symbol = latexSymbols['\\' + command];
  if (symbol) {
    return { result: symbol, end: i };
  }

  // 处理特殊命令
  if (command === 'frac') {
    return parseFrac(latex, i);
  }
  if (command === 'sqrt') {
    return parseSqrt(latex, i);
  }
  if (command === 'text' || command === 'mathrm' || command === 'textbf' || command === 'textit') {
    return parseText(latex, i);
  }
  if (command === 'hat' || command === 'bar' || command === 'vec' || command === 'dot' || command === 'ddot' || command === 'tilde') {
    return parseAccent(latex, i, command);
  }

  // 未知命令，返回原文
  return { result: '\\' + command, end: i };
}

// 解析分数 \frac{a}{b}
function parseFrac(latex, pos) {
  let i = pos;

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  // 解析分子
  if (latex[i] !== '{') {
    return { result: '\\frac', end: i };
  }
  const numerator = parseGroup(latex, i);
  if (!numerator) {
    return { result: '\\frac', end: i };
  }
  i = numerator.end;

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  // 解析分母
  if (latex[i] !== '{') {
    return { result: '\\frac' + numerator.result, end: i };
  }
  const denominator = parseGroup(latex, i);
  if (!denominator) {
    return { result: '\\frac' + numerator.result, end: i };
  }

  // 使用 Unicode 分数表示
  const result = `<span class="latex-fraction">
    <span class="latex-numerator">${numerator.result}</span>
    <span class="latex-denominator">${denominator.result}</span>
  </span>`;

  return { result, end: denominator.end };
}

// 解析根号 \sqrt{x} 或 \sqrt[n]{x}
function parseSqrt(latex, pos) {
  let i = pos;

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  let index = '';

  // 检查是否有可选参数 [n]
  if (latex[i] === '[') {
    i++;
    let depth = 1;
    let start = i;
    while (i < latex.length && depth > 0) {
      if (latex[i] === '[') depth++;
      if (latex[i] === ']') depth--;
      i++;
    }
    index = latex.slice(start, i - 1);
  }

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  // 解析被开方数
  if (latex[i] !== '{') {
    return { result: '\\sqrt', end: i };
  }
  const content = parseGroup(latex, i);
  if (!content) {
    return { result: '\\sqrt', end: i };
  }

  // 构建结果
  let result;
  if (index) {
    result = `<span class="latex-sqrt">
      <span class="latex-sqrt-index">${index}</span>
      <span class="latex-sqrt-content">${content.result}</span>
    </span>`;
  } else {
    result = `<span class="latex-sqrt">
      <span class="latex-sqrt-content">${content.result}</span>
    </span>`;
  }

  return { result, end: content.end };
}

// 解析文本 \text{...}
function parseText(latex, pos) {
  let i = pos;

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  if (latex[i] !== '{') {
    return { result: '', end: i };
  }

  const content = parseGroup(latex, i);
  if (!content) {
    return { result: '', end: i };
  }

  return { result: `<span class="latex-text">${escapeHtml(content.result)}</span>`, end: content.end };
}

// 解析重音符号 \hat{x}, \bar{x}, \vec{x}, etc.
function parseAccent(latex, pos, accent) {
  let i = pos;

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  // 获取下一个字符或组
  let content;
  if (latex[i] === '{') {
    content = parseGroup(latex, i);
  } else if (i < latex.length) {
    content = { result: latex[i], end: i + 1 };
  } else {
    return { result: '\\' + accent, end: i };
  }

  if (!content) {
    return { result: '\\' + accent, end: i };
  }

  // 根据重音类型添加符号
  let accentMark;
  switch (accent) {
    case 'hat':
      accentMark = '̂';
      break;
    case 'bar':
      accentMark = '̄';
      break;
    case 'vec':
      accentMark = '→';
      break;
    case 'dot':
      accentMark = '̇';
      break;
    case 'ddot':
      accentMark = '̈';
      break;
    case 'tilde':
      accentMark = '̃';
      break;
    default:
      accentMark = '';
  }

  return { result: content.result + accentMark, end: content.end };
}

// 解析花括号组 {...}
function parseGroup(latex, pos) {
  if (latex[pos] !== '{') {
    return null;
  }

  let i = pos + 1;
  let depth = 1;
  let result = '';

  while (i < latex.length && depth > 0) {
    if (latex[i] === '{') {
      depth++;
    } else if (latex[i] === '}') {
      depth--;
      if (depth === 0) break;
    }

    if (latex[i] === '\\') {
      // 处理转义字符
      const cmdResult = parseCommand(latex, i + 1);
      result += cmdResult.result;
      i = cmdResult.end;
    } else if (depth === 1) {
      result += latex[i];
    }

    i++;
  }

  if (depth !== 0) {
    return null;
  }

  return { result, end: i + 1 };
}

// 解析上下标 _{} ^{}
function parseScript(latex, pos, type) {
  let i = pos;

  // 跳过空白
  while (i < latex.length && latex[i] === ' ') i++;

  let content;
  if (latex[i] === '{') {
    content = parseGroup(latex, i);
  } else if (i < latex.length) {
    content = { result: latex[i], end: i + 1 };
  } else {
    return { result: '', end: i };
  }

  if (!content) {
    return { result: '', end: i };
  }

  const className = type === '_' ? 'latex-subscript' : 'latex-superscript';
  return { result: `<span class="${className}">${content.result}</span>`, end: content.end };
}

/**
 * 将 LaTeX 公式转换为 HTML
 * @param {string} latex - LaTeX 公式
 * @returns {string} - HTML 字符串
 */
export function latexToHtml(latex) {
  if (!latex) return '';

  let html = '';
  let i = 0;

  while (i < latex.length) {
    // 转义字符
    if (latex[i] === '\\') {
      const cmdResult = parseCommand(latex, i + 1);
      html += cmdResult.result;
      i = cmdResult.end;
      continue;
    }

    // 下标
    if (latex[i] === '_') {
      const scriptResult = parseScript(latex, i + 1, '_');
      html += scriptResult.result;
      i = scriptResult.end;
      continue;
    }

    // 上标
    if (latex[i] === '^') {
      const scriptResult = parseScript(latex, i + 1, '^');
      html += scriptResult.result;
      i = scriptResult.end;
      continue;
    }

    // 花括号组
    if (latex[i] === '{') {
      const groupResult = parseGroup(latex, i);
      if (groupResult) {
        html += groupResult.result;
        i = groupResult.end;
        continue;
      }
    }

    // 空格
    if (latex[i] === ' ') {
      html += ' ';
      i++;
      continue;
    }

    // 其他字符
    html += escapeHtml(latex[i]);
    i++;
  }

  return html;
}

/**
 * 检测文本是否包含 LaTeX 公式
 * @param {string} text - 文本
 * @returns {boolean} - 是否包含公式
 */
export function hasLatex(text) {
  if (!text) return false;

  // 检测行内公式 $...$
  if (/\$[^$\n]+\$/g.test(text)) {
    return true;
  }

  // 检测块级公式 $$...$$
  if (/\$\$[\s\S]*?\$\$/g.test(text)) {
    return true;
  }

  // 检测 LaTeX 命令
  if (/\\[a-zA-Z]+/g.test(text)) {
    return true;
  }

  return false;
}
