import { BASE_URL } from './config';

const TOKEN_KEY = 'ai_cs_token';

export function getToken() {
  try {
    return uni.getStorageSync(TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token);
}

/**
 * 统一请求封装。后端返回 { code, message, data }。
 * code === 0 视为成功，返回 data；否则 reject(message)。
 */
export function request(options) {
  const fullUrl = BASE_URL + options.url;
  console.log('[Request] ->', options.method || 'GET', fullUrl);

  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        Authorization: getToken() ? `Bearer ${getToken()}` : '',
        ...(options.header || {}),
      },
      success: (res) => {
        const body = res.data || {};
        console.log('[Request] <- status:', res.statusCode, 'body:', JSON.stringify(body).slice(0, 200));
        // 后端统一返回 {code, message, data}，NestJS POST 默认 201，这里 200/201 都视为成功
        if ((res.statusCode === 200 || res.statusCode === 201) && body.code === 0) {
          console.log('[Request] resolve data:', JSON.stringify(body.data || null).slice(0, 200));
          resolve(body.data ?? null);
        } else if (res.statusCode === 401) {
          reject({ code: 401, message: body.message || '登录已过期' });
        } else {
          reject({ code: body.code, message: body.message || '请求失败' });
        }
      },
      fail: (err) => {
        console.error('[Request] fail:', JSON.stringify(err));
        reject({ code: -1, message: '网络异常，请稍后再试' });
      },
    });
  });
}
