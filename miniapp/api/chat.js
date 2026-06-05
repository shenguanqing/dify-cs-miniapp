import { request, getToken } from './request';
import { BASE_URL } from './config';

export function getConfig() {
  return request({ url: '/ai/config' });
}

export function newConversation(scene = 'default') {
  return request({
    url: '/ai/conversation/new',
    method: 'POST',
    data: { scene },
  });
}

export function sendChat({ question, conversationId, scene }) {
  return request({
    url: '/ai/chat',
    method: 'POST',
    data: { question, conversationId, scene, stream: false },
  });
}

/**
 * SSE 流式发送问题。
 * 开启 enableChunked，通过回调逐块接收后端透传的 SSE 数据。
 *
 * 后端 SSE 事件格式：
 *   { type: 'chunk', text: '...' }     文本片段
 *   { type: 'end' }                    消息结束（后端不再有新 chunk）
 *   { type: 'done', conversationId, difyMessageId }  全部完成
 *   { type: 'error', message: '...' }  错误
 *
 * @param {Object}   params            问题参数
 * @param {Function} callbacks          回调集合
 * @param {Function} callbacks.onChunk  收到文本片段 (text: string)
 * @param {Function} callbacks.onDone   流式结束 ({ conversationId, difyMessageId })
 * @param {Function} callbacks.onError  出错 (message: string)
 */
export function sendChatStream({ question, conversationId, scene }, callbacks) {
  const { onChunk, onDone, onError } = callbacks;
  const fullUrl = BASE_URL + '/ai/chat';

  const task = uni.request({
    url: fullUrl,
    method: 'POST',
    data: { question, conversationId, scene, stream: true },
    enableChunked: true,
    header: {
      'Content-Type': 'application/json',
      Authorization: getToken() ? `Bearer ${getToken()}` : '',
    },
    success() {
      // 流式请求的 success 只表示连接建立/完成，数据通过 onChunkReceived 接收
    },
    fail(err) {
      (onError || (() => {}))(err.errMsg || '网络异常，请稍后再试');
    },
  });

  let sseBuffer = '';

  task.onChunkReceived(function (res) {
    // res.data 是 ArrayBuffer，需要解码为文本并追加到 buffer
    const text = arrayBufferToString(res.data);
    sseBuffer += text;

    // 按行拆分，最后一行可能不完整，保留到下次
    const lines = sseBuffer.split('\n');
    sseBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const evt = JSON.parse(jsonStr);
        if (evt.type === 'chunk' && evt.text) {
          (onChunk || (() => {}))(evt.text);
        } else if (evt.type === 'done') {
          (onDone || (() => {}))({
            conversationId: evt.conversationId,
            messageId: evt.messageId,
            difyMessageId: evt.difyMessageId,
            sources: evt.sources || [],
          });
        } else if (evt.type === 'error') {
          (onError || (() => {}))(evt.message || '智能客服繁忙，请稍后再试或转人工');
        }
      } catch {
        // 跳过无法解析的行
      }
    }
  });

  return task;
}

/** 将 ArrayBuffer 解码为 UTF-8 字符串 */
function arrayBufferToString(buffer) {
  const bytes = new Uint8Array(buffer);
  // 优先使用 TextDecoder
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  // 手动 UTF-8 解码（兼容不支持 TextDecoder 的环境）
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    if (b0 < 0x80) {
      // 1 字节（ASCII）
      result += String.fromCharCode(b0);
      i += 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      // 2 字节
      result += String.fromCharCode(((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      // 3 字节（中文）
      result += String.fromCharCode(
        ((b0 & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else if ((b0 & 0xf8) === 0xf0) {
      // 4 字节（emoji 等，需要代理对）
      const cp =
        ((b0 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      result += String.fromCharCode(0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff));
      i += 4;
    } else {
      // 无效字节，跳过
      result += String.fromCharCode(b0);
      i += 1;
    }
  }
  return result;
}

export function getHistory(conversationId) {
  return request({ url: `/ai/history?conversationId=${conversationId}` });
}

export function sendFeedback(messageId, rating) {
  return request({
    url: '/ai/feedback',
    method: 'POST',
    data: { messageId, rating },
  });
}

export function requestHandoff(conversationId, reason = '') {
  return request({
    url: '/ai/handoff',
    method: 'POST',
    data: { conversationId, reason },
  });
}
