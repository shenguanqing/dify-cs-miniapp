// 后端基地址。
// 微信开发者工具勾选「不校验合法域名」可用 http://localhost:3000
// 真机/上线必须是已备案的 HTTPS 域名，并在小程序后台配置 request 合法域名。
export const BASE_URL = 'http://localhost:3000/api';

// 是否使用流式（SSE）。需要后端 stream=true 且基础库支持 enableChunked。
// 默认 true：真流式输出，回答逐字出现，体验更好。
export const USE_STREAM = true;
