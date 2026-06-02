import { request, getToken, setToken } from './request';

/**
 * 静默登录：wx.login 拿 code -> 后端换 token。
 * 已有 token 则直接复用。
 */
export async function ensureLogin() {
  // 步骤1：检查本地是否已有 token
  const existing = getToken();
  if (existing) {
    console.log('[Auth] 已有本地 token，直接复用');
    return existing;
  }

  console.log('[Auth] 无本地 token，准备调用 uni.login');

  // 步骤2：调用微信登录（包装为 Promise 以便 await）
  const code = await new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res.code),
      fail: (err) => reject(err),
    });
  });
  console.log('[Auth] uni.login 成功，code:', code);

  // 步骤3：发给后端换 token
  const data = await request({
    url: '/auth/login',
    method: 'POST',
    data: { code },
  });
  console.log('[Auth] 后端返回 data:', JSON.stringify(data));

  // 步骤4：存储 token 并验证
  const token = data && data.token;
  if (!token) {
    console.error('[Auth] 后端未返回 token，完整 data:', JSON.stringify(data));
    throw { code: -1, message: '登录失败：后端未返回 token' };
  }

  setToken(token);
  const stored = getToken();
  console.log('[Auth] token 已存储，验证:', stored ? 'OK' : 'FAIL');

  if (!stored) {
    throw { code: -1, message: '登录失败：token 存储失败' };
  }

  return stored;
}
