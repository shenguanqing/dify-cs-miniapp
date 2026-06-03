/**
 * 轻量级代码语法高亮器
 * 为微信小程序提供基本的代码高亮功能
 */

// 语言关键字定义
const languageKeywords = {
  javascript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false', 'NaN', 'Infinity'],
    builtins: ['console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Map', 'Set', 'Promise', 'Symbol', 'Error', 'TypeError', 'RangeError'],
  },
  typescript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false', 'NaN', 'Infinity', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'implements', 'readonly', 'private', 'protected', 'public', 'static', 'as', 'is', 'keyof', 'never', 'unknown', 'any', 'void'],
    builtins: ['console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Map', 'Set', 'Promise', 'Symbol', 'Error', 'TypeError', 'RangeError', 'Partial', 'Required', 'Readonly', 'Record', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'ReturnType', 'InstanceType'],
  },
  python: {
    keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'yield', 'lambda', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'global', 'nonlocal', 'assert', 'del', 'async', 'await'],
    builtins: ['print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'tuple', 'set', 'bool', 'type', 'isinstance', 'issubclass', 'hasattr', 'getattr', 'setattr', 'property', 'classmethod', 'staticmethod', 'super', 'self', 'cls', 'Exception', 'ValueError', 'TypeError', 'KeyError', 'IndexError', 'AttributeError', 'ImportError', 'FileNotFoundError', 'IOError', 'OSError'],
  },
  java: {
    keywords: ['public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'volatile', 'transient', 'class', 'interface', 'enum', 'extends', 'implements', 'import', 'package', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'throws', 'void', 'null', 'true', 'false', 'instanceof', 'default'],
    builtins: ['String', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character', 'Byte', 'Short', 'Object', 'System', 'Math', 'Arrays', 'Collections', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Queue', 'LinkedList', 'Exception', 'RuntimeException', 'IOException', 'NullPointerException', 'IndexOutOfBoundsException', 'ClassCastException', 'IllegalArgumentException'],
  },
  html: {
    keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'br', 'hr', 'script', 'style', 'link', 'meta', 'title', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside'],
    builtins: ['class', 'id', 'href', 'src', 'alt', 'title', 'style', 'type', 'name', 'value', 'placeholder', 'disabled', 'required', 'checked', 'selected', 'multiple', 'readonly', 'action', 'method', 'target', 'rel', 'charset', 'content', 'http-equiv'],
  },
  css: {
    keywords: ['color', 'background', 'background-color', 'background-image', 'background-size', 'background-position', 'margin', 'padding', 'border', 'border-radius', 'font-size', 'font-weight', 'font-family', 'text-align', 'text-decoration', 'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'max-width', 'min-width', 'max-height', 'min-height', 'overflow', 'z-index', 'opacity', 'transform', 'transition', 'animation', 'flex', 'grid', 'justify-content', 'align-items', 'box-shadow', 'cursor', 'visibility', 'float', 'clear'],
    builtins: ['inherit', 'initial', 'unset', 'none', 'auto', 'normal', 'bold', 'italic', 'underline', 'block', 'inline', 'inline-block', 'flex', 'grid', 'absolute', 'relative', 'fixed', 'sticky', 'static', 'hidden', 'visible', 'scroll', 'center', 'left', 'right', 'top', 'bottom', 'solid', 'dashed', 'dotted', 'transparent', 'currentColor'],
  },
  sql: {
    keywords: ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'ANY', 'SOME', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT'],
    builtins: ['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL', 'CHAR', 'VARCHAR', 'TEXT', 'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'BLOB', 'CLOB', 'SERIAL', 'UUID'],
  },
  bash: {
    keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'local', 'export', 'source', 'alias', 'unalias', 'set', 'unset', 'shift', 'readonly', 'declare', 'typeset', 'eval', 'exec', 'trap', 'wait', 'kill', 'bg', 'fg', 'jobs', 'disown', 'suspend', 'continue', 'break'],
    builtins: ['echo', 'printf', 'read', 'test', 'cd', 'pwd', 'ls', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'touch', 'cat', 'grep', 'sed', 'awk', 'find', 'sort', 'uniq', 'wc', 'head', 'tail', 'more', 'less', 'chmod', 'chown', 'chgrp', 'ps', 'top', 'kill', 'df', 'du', 'free', 'mount', 'umount', 'tar', 'gzip', 'gunzip', 'zip', 'unzip', 'wget', 'curl', 'ssh', 'scp', 'rsync', 'git', 'docker', 'npm', 'yarn', 'pip', 'python', 'node', 'java', 'gcc', 'make'],
  },
  json: {
    keywords: [],
    builtins: ['true', 'false', 'null'],
  },
  markdown: {
    keywords: [],
    builtins: [],
  },
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

// 高亮单个 token
function highlightToken(token, type) {
  const escaped = escapeHtml(token);
  switch (type) {
    case 'keyword':
      return `<span class="hl-keyword">${escaped}</span>`;
    case 'builtin':
      return `<span class="hl-builtin">${escaped}</span>`;
    case 'string':
      return `<span class="hl-string">${escaped}</span>`;
    case 'comment':
      return `<span class="hl-comment">${escaped}</span>`;
    case 'number':
      return `<span class="hl-number">${escaped}</span>`;
    case 'operator':
      return `<span class="hl-operator">${escaped}</span>`;
    case 'punctuation':
      return `<span class="hl-punctuation">${escaped}</span>`;
    default:
      return escaped;
  }
}

// JavaScript/TypeScript 高亮
function highlightJS(code, lang) {
  const langDef = languageKeywords[lang] || languageKeywords.javascript;
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 单行注释
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 多行注释
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length;
      else end += 2;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 字符串（单引号、双引号、模板字符串）
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++; // 跳过转义字符
        j++;
      }
      if (j < code.length) j++; // 包含结束引号
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 数字
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.xXaAbBcCdDeEfF]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 标识符
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (langDef.keywords.includes(word)) {
        result += highlightToken(word, 'keyword');
      } else if (langDef.builtins.includes(word)) {
        result += highlightToken(word, 'builtin');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 运算符
    if (/[+\-*/%=!<>&|^~?:]/.test(code[i])) {
      result += highlightToken(code[i], 'operator');
      i++;
      continue;
    }

    // 标点符号
    if (/[{}()\[\];,.]/.test(code[i])) {
      result += highlightToken(code[i], 'punctuation');
      i++;
      continue;
    }

    // 其他字符
    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

// Python 高亮
function highlightPython(code) {
  const langDef = languageKeywords.python;
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 单行注释
    if (code[i] === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 多行字符串
    if ((code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''")) {
      const quote = code.slice(i, i + 3);
      let j = i + 3;
      while (j < code.length && code.slice(j, j + 3) !== quote) {
        j++;
      }
      if (j < code.length) j += 3;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 字符串
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < code.length) j++;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 数字
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.xXoObBeE_]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 标识符
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (langDef.keywords.includes(word)) {
        result += highlightToken(word, 'keyword');
      } else if (langDef.builtins.includes(word)) {
        result += highlightToken(word, 'builtin');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 运算符
    if (/[+\-*/%=!<>&|^~@:]/.test(code[i])) {
      result += highlightToken(code[i], 'operator');
      i++;
      continue;
    }

    // 标点符号
    if (/[{}()\[\];,.]/.test(code[i])) {
      result += highlightToken(code[i], 'punctuation');
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

// HTML 高亮
function highlightHTML(code) {
  const langDef = languageKeywords.html;
  let result = '';
  let i = 0;
  let inTag = false;

  while (i < code.length) {
    // HTML 注释
    if (code.slice(i, i + 4) === '<!--') {
      let end = code.indexOf('-->', i + 4);
      if (end === -1) end = code.length;
      else end += 3;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 标签开始
    if (code[i] === '<') {
      inTag = true;
      result += highlightToken('<', 'punctuation');
      i++;
      continue;
    }

    // 标签结束
    if (code[i] === '>') {
      inTag = false;
      result += highlightToken('>', 'punctuation');
      i++;
      continue;
    }

    // 标签名
    if (inTag && /[a-zA-Z]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9-]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (langDef.keywords.includes(word.toLowerCase())) {
        result += highlightToken(word, 'keyword');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 属性名
    if (inTag && /[a-zA-Z]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9-]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (langDef.builtins.includes(word.toLowerCase())) {
        result += highlightToken(word, 'builtin');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 字符串
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        j++;
      }
      if (j < code.length) j++;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

// CSS 高亮
function highlightCSS(code) {
  const langDef = languageKeywords.css;
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 注释
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length;
      else end += 2;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 字符串
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < code.length) j++;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 颜色值
    if (code[i] === '#' && /[0-9a-fA-F]/.test(code[i + 1])) {
      let j = i + 1;
      while (j < code.length && /[0-9a-fA-F]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 数字
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) {
        j++;
      }
      // 单位
      while (j < code.length && /[a-zA-Z%]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 属性名
    if (/[a-zA-Z-]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9-]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (langDef.keywords.includes(word.toLowerCase())) {
        result += highlightToken(word, 'keyword');
      } else if (langDef.builtins.includes(word.toLowerCase())) {
        result += highlightToken(word, 'builtin');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 选择器特殊字符
    if (/[.#:]/.test(code[i])) {
      result += highlightToken(code[i], 'operator');
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

// SQL 高亮
function highlightSQL(code) {
  const langDef = languageKeywords.sql;
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 单行注释
    if (code[i] === '-' && code[i + 1] === '-') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 多行注释
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length;
      else end += 2;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 字符串
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === "'") j++; // SQL 转义
        j++;
      }
      if (j < code.length) j++;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 数字
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 标识符
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      const upperWord = word.toUpperCase();
      if (langDef.keywords.includes(upperWord)) {
        result += highlightToken(word, 'keyword');
      } else if (langDef.builtins.includes(upperWord)) {
        result += highlightToken(word, 'builtin');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 运算符
    if (/[+\-*/%=!<>&|^~]/.test(code[i])) {
      result += highlightToken(code[i], 'operator');
      i++;
      continue;
    }

    // 标点符号
    if (/[{}()\[\];,.]/.test(code[i])) {
      result += highlightToken(code[i], 'punctuation');
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

// Bash 高亮
function highlightBash(code) {
  const langDef = languageKeywords.bash;
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 注释
    if (code[i] === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      result += highlightToken(code.slice(i, end), 'comment');
      i = end;
      continue;
    }

    // 字符串
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < code.length) j++;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 变量
    if (code[i] === '$') {
      let j = i + 1;
      if (code[j] === '{') {
        j++;
        while (j < code.length && code[j] !== '}') {
          j++;
        }
        if (j < code.length) j++;
      } else {
        while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) {
          j++;
        }
      }
      result += highlightToken(code.slice(i, j), 'builtin');
      i = j;
      continue;
    }

    // 数字
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 标识符
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (langDef.keywords.includes(word)) {
        result += highlightToken(word, 'keyword');
      } else if (langDef.builtins.includes(word)) {
        result += highlightToken(word, 'builtin');
      } else {
        result += escapeHtml(word);
      }
      i = j;
      continue;
    }

    // 运算符
    if (/[+\-*/%=!<>&|^~]/.test(code[i])) {
      result += highlightToken(code[i], 'operator');
      i++;
      continue;
    }

    // 标点符号
    if (/[{}()\[\];,.]/.test(code[i])) {
      result += highlightToken(code[i], 'punctuation');
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

// JSON 高亮
function highlightJSON(code) {
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 字符串
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < code.length) j++;
      result += highlightToken(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // 数字
    if (/[\d-]/.test(code[i])) {
      let j = i;
      if (code[j] === '-') j++;
      while (j < code.length && /[\d.]/.test(code[j])) {
        j++;
      }
      result += highlightToken(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // 布尔值和 null
    if (code.slice(i, i + 4) === 'true' || code.slice(i, i + 5) === 'false' || code.slice(i, i + 4) === 'null') {
      let word;
      if (code.slice(i, i + 4) === 'true') {
        word = 'true';
      } else if (code.slice(i, i + 5) === 'false') {
        word = 'false';
      } else {
        word = 'null';
      }
      result += highlightToken(word, 'keyword');
      i += word.length;
      continue;
    }

    // 标点符号
    if (/[{}()\[\]:,]/.test(code[i])) {
      result += highlightToken(code[i], 'punctuation');
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

/**
 * 对代码进行语法高亮
 * @param {string} code - 代码文本
 * @param {string} lang - 编程语言
 * @returns {string} - 高亮后的 HTML
 */
export function highlightCode(code, lang) {
  if (!code) return '';

  const normalizedLang = (lang || '').toLowerCase().trim();

  switch (normalizedLang) {
    case 'javascript':
    case 'js':
    case 'jsx':
      return highlightJS(code, 'javascript');
    case 'typescript':
    case 'ts':
    case 'tsx':
      return highlightJS(code, 'typescript');
    case 'python':
    case 'py':
      return highlightPython(code);
    case 'html':
    case 'htm':
    case 'xml':
    case 'svg':
      return highlightHTML(code);
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return highlightCSS(code);
    case 'sql':
      return highlightSQL(code);
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return highlightBash(code);
    case 'json':
      return highlightJSON(code);
    case 'java':
    case 'c':
    case 'cpp':
    case 'csharp':
    case 'go':
    case 'rust':
    case 'ruby':
    case 'php':
    case 'swift':
    case 'kotlin':
      return highlightJS(code, normalizedLang);
    default:
      // 未知语言，尝试通用高亮
      return highlightJS(code, 'javascript');
  }
}
