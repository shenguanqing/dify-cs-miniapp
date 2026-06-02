import { request } from './request';

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
