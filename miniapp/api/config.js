// 后端基地址。
// 开发环境：http://localhost:3000（开发者工具勾选「不校验合法域名」）
// 真机调试/上线：https 域名（需在小程序后台配置 request 合法域名）
const isDev = true; // 开发时用 true，真机调试/上线改为 false
export const BASE_URL = isDev
  ? 'http://localhost:3000/api'
  : 'https://your-domain.com/api'; // 替换为你的实际域名

// 是否使用流式（SSE）。需要后端 stream=true 且基础库支持 enableChunked。
// 默认 true：真流式输出，回答逐字出现，体验更好。
export const USE_STREAM = true;
