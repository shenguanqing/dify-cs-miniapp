<template>
  <view class="chat-page">
    <!-- 顶部栏：有历史消息时显示「新对话」入口 -->
    <view class="top-bar" v-if="messages.length > 0">
      <view class="new-chat-btn" @tap="newChat">
        <text class="new-chat-icon">＋</text>
        <text class="new-chat-text">新对话</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="msg-list"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      :show-scrollbar="false"
    >
      <!-- 欢迎界面 -->
      <view class="welcome-section" v-if="messages.length === 0">
        <text class="welcome-title">您好！</text>
        <text class="welcome-desc">我是您的智能助手，随时为您服务</text>
      </view>

      <view v-for="(m, idx) in messages" :key="idx" class="msg-row">
        <!-- 用户气泡（右侧）-->
        <view v-if="m.role === 'user'" class="row row-right">
          <view class="bubble bubble-sent">
            <text class="bubble-text">{{ m.content }}</text>
          </view>
        </view>

        <!-- AI 气泡（左侧）-->
        <view v-else class="row row-left">
          <view class="ai-avatar">
            <text class="avatar-text">AI</text>
          </view>
          <view class="bubble bubble-received">
            <!-- 打字中显示纯文本 -->
            <text v-if="m.typing" class="bubble-text">{{ m.content }}</text>
            <!-- 打字完成后显示 Markdown 渲染 -->
            <rich-text v-else class="bubble-markdown" :nodes="m.renderedContent" @itemclick="handleItemClick"></rich-text>
            <view v-if="m.typing" class="typing-indicator">
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
            </view>
          </view>
        </view>

        <!-- 引用来源 -->
        <view v-if="m.role === 'ai' && !m.typing && m.sources && m.sources.length" class="sources-row">
          <view class="sources-card">
            <view class="sources-header">
              <view class="sources-icon-wrap">
                <text class="sources-icon">📚</text>
              </view>
              <text class="sources-label">参考来源</text>
            </view>
            <view v-for="(s, i) in m.sources" :key="i" class="source-item">
              <view class="source-index">{{ i + 1 }}</view>
              <text class="source-name">{{ s.documentName || '文档片段' }}</text>
            </view>
          </view>
        </view>

        <!-- 操作区 -->
        <view v-if="m.role === 'ai' && !m.typing && m.content" class="actions-row">
          <view class="action-btn" @tap="copyText(m.content)">
            <text class="action-icon">📋</text>
            <text class="action-text">复制</text>
          </view>
          <view
            class="action-btn"
            :class="{ 'action-liked': m.feedback === 1 }"
            @tap="feedback(m, 1)"
          >
            <text class="action-icon">{{ m.feedback === 1 ? '👍' : '👍' }}</text>
          </view>
          <view
            class="action-btn"
            :class="{ 'action-disliked': m.feedback === -1 }"
            @tap="feedback(m, -1)"
          >
            <text class="action-icon">{{ m.feedback === -1 ? '👎' : '👎' }}</text>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 底部区域 -->
    <view class="bottom-area">
      <view class="handoff-bar" v-if="config.enableHandoff" @tap="handoff">
        <text class="handoff-text">没解决问题？</text>
        <text class="handoff-link">转人工客服</text>
      </view>

      <view class="input-bar">
        <view class="input-wrap">
          <input
            class="input"
            v-model="inputText"
            :placeholder="config.placeholder || '输入消息...'"
            placeholder-class="input-placeholder"
            confirm-type="send"
            :disabled="sending"
            @confirm="send"
            :adjust-position="true"
          />
        </view>
        <view
          class="send-btn"
          :class="{ active: inputText.trim() && !sending }"
          @tap="send"
        >
          <text class="send-icon">↑</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ensureLogin } from '../../api/auth';
import {
  getConfig,
  newConversation,
  sendChat,
  sendFeedback,
  requestHandoff,
  getHistory,
} from '../../api/chat';
import { markdownToHtml } from '../../utils/markdown';

// 本地存储 key：保存当前会话 ID，下次进入小程序时恢复历史
const CONVERSATION_STORAGE_KEY = 'ai_cs_conversation_id';

export default {
  data() {
    return {
      config: {},
      messages: [],
      inputText: '',
      sending: false,
      conversationId: '',
      scene: 'default',
      scrollTop: 0,
      loadingHistory: false,
    };
  },
  async onLoad() {
    try {
      await ensureLogin();
      this.config = await getConfig();

      // 尝试恢复上次的会话并加载历史消息
      const savedId = uni.getStorageSync(CONVERSATION_STORAGE_KEY);
      if (savedId) {
        const restored = await this.loadHistory(savedId);
        if (restored) {
          this.conversationId = savedId;
          return;
        }
        // 历史加载失败（会话已失效），清除并新建
        uni.removeStorageSync(CONVERSATION_STORAGE_KEY);
      }

      // 没有可恢复的会话，新建一个
      const conv = await newConversation(this.scene);
      this.conversationId = conv.conversationId;
      uni.setStorageSync(CONVERSATION_STORAGE_KEY, conv.conversationId);
    } catch (e) {
      uni.showToast({ title: e.message || '初始化失败', icon: 'none' });
    }
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 100000;
      });
    },

    /**
     * 加载指定会话的历史消息并渲染。
     * 后端 history 返回的是「一问一答」记录，需拆成 user / ai 两条气泡。
     * @returns {boolean} 是否成功加载到历史
     */
    async loadHistory(conversationId) {
      this.loadingHistory = true;
      try {
        const list = await getHistory(conversationId);
        if (!Array.isArray(list) || list.length === 0) {
          return false;
        }

        const msgs = [];
        list.forEach((item) => {
          // 用户提问
          if (item.question) {
            msgs.push({ role: 'user', content: item.question });
          }
          // AI 回答（直接渲染 Markdown，无打字动画）
          if (item.answer) {
            msgs.push({
              role: 'ai',
              content: item.answer,
              renderedContent: this.renderMarkdown(item.answer),
              typing: false,
              sources: [],
              feedback: item.feedback || 0,
              messageId: item.id || '',
            });
          }
        });

        this.messages = msgs;
        this.scrollToBottom();
        return true;
      } catch (e) {
        // 会话不存在或网络异常，交由调用方处理
        return false;
      } finally {
        this.loadingHistory = false;
      }
    },

    /** 开启新对话：清空当前消息并新建会话。 */
    async newChat() {
      if (this.sending) return;
      try {
        const conv = await newConversation(this.scene);
        this.conversationId = conv.conversationId;
        uni.setStorageSync(CONVERSATION_STORAGE_KEY, conv.conversationId);
        this.messages = [];
        this.inputText = '';
      } catch (e) {
        uni.showToast({ title: e.message || '新建会话失败', icon: 'none' });
      }
    },

    renderMarkdown(content) {
      if (!content) return '';

      // 总是调用 markdownToHtml，它会自动处理纯文本
      return markdownToHtml(content);
    },

    async send() {
      const text = this.inputText.trim();
      if (!text || this.sending) return;

      this.messages.push({ role: 'user', content: text });
      this.inputText = '';
      this.sending = true;
      this.scrollToBottom();

      const aiMsg = {
        role: 'ai',
        content: '',
        renderedContent: '',
        typing: true,
        sources: [],
        feedback: 0,
        messageId: '',
      };
      this.messages.push(aiMsg);
      this.scrollToBottom();

      try {
        const data = await sendChat({
          question: text,
          conversationId: this.conversationId,
          scene: this.scene,
        });
        this.conversationId = data.conversationId || this.conversationId;
        // 持久化会话 ID，下次进入小程序可恢复历史
        if (this.conversationId) {
          uni.setStorageSync(CONVERSATION_STORAGE_KEY, this.conversationId);
        }
        aiMsg.messageId = data.messageId;
        aiMsg.sources = data.sources || [];
        await this.typeWriter(aiMsg, data.answer || '（暂无回答）');
        // 打字完成后，渲染 Markdown
        aiMsg.renderedContent = this.renderMarkdown(aiMsg.content);
      } catch (e) {
        aiMsg.typing = false;
        aiMsg.content = e.message || '智能客服繁忙，请稍后再试或转人工';
        aiMsg.renderedContent = this.renderMarkdown(aiMsg.content);
      } finally {
        aiMsg.typing = false;
        this.sending = false;
        this.scrollToBottom();
      }
    },

    typeWriter(msg, fullText) {
      return new Promise((resolve) => {
        let i = 0;
        const step = () => {
          if (i >= fullText.length) {
            msg.typing = false;
            resolve();
            return;
          }
          msg.content += fullText.slice(i, i + 2);
          i += 2;
          this.scrollToBottom();
          setTimeout(step, 18);
        };
        step();
      });
    },

    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: '已复制', icon: 'none' }),
      });
    },

    handleItemClick(e) {
      // 处理 rich-text 中的点击事件
      const node = e.detail.node;
      if (node && node.name === 'img' && node.attrs && node.attrs.src) {
        this.previewImage(node.attrs.src);
      }
    },

    previewImage(src) {
      if (!src) return;

      // 收集当前消息中所有的图片 URLs
      const imageUrls = [];
      this.messages.forEach((msg) => {
        if (msg.role === 'ai' && msg.content) {
          const imgRegex = /!\[.*?\]\((.*?)\)/g;
          let match;
          while ((match = imgRegex.exec(msg.content)) !== null) {
            if (match[1]) {
              imageUrls.push(match[1]);
            }
          }
        }
      });

      // 如果没有找到图片，至少包含当前图片
      if (imageUrls.length === 0) {
        imageUrls.push(src);
      }

      uni.previewImage({
        current: src,
        urls: imageUrls,
        success: () => {
          console.log('[Preview] 图片预览成功');
        },
        fail: (err) => {
          console.error('[Preview] 图片预览失败:', err);
          uni.showToast({ title: '预览失败', icon: 'none' });
        },
      });
    },

    async feedback(msg, rating) {
      if (!msg.messageId) return;
      try {
        await sendFeedback(msg.messageId, rating);
        msg.feedback = rating;
        uni.showToast({ title: '感谢反馈', icon: 'none' });
      } catch (e) {
        uni.showToast({ title: e.message || '反馈失败', icon: 'none' });
      }
    },

    async handoff() {
      if (!this.conversationId) return;
      try {
        const res = await requestHandoff(this.conversationId, '用户主动转人工');
        uni.showModal({
          title: '转人工',
          content: res.message || '已为您转接人工客服',
          showCancel: false,
        });
      } catch (e) {
        uni.showToast({ title: e.message || '转接失败', icon: 'none' });
      }
    },
  },
};
</script>

<style>
/* ===== 设计系统变量 ===== */
page {
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  --color-success: #10b981;
  --color-error: #ef4444;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --radius-sm: 8rpx;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 20rpx;
  --radius-full: 9999rpx;

  background-color: var(--color-bg);
  height: 100%;
  overflow: hidden;
}

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  overflow: hidden;
}

/* ===== 顶部栏 ===== */
.top-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12rpx 24rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  background: var(--color-bg-secondary);
  border: 1rpx solid var(--color-border);
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.new-chat-btn:active {
  transform: scale(0.95);
  background: var(--color-bg-tertiary);
}

.new-chat-icon {
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 700;
  line-height: 1;
}

.new-chat-text {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ===== 消息列表 ===== */
.msg-list {
  flex: 1;
  padding: 24rpx 24rpx 0;
  box-sizing: border-box;
  overflow-y: auto;
  background: var(--color-bg);
}

.msg-list ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.bottom-spacer {
  height: 24rpx;
}

/* ===== 欢迎界面 ===== */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 300rpx);
  padding: 60rpx;
  box-sizing: border-box;
  text-align: center;
}

.welcome-title {
  font-size: 52rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 24rpx;
  letter-spacing: 4rpx;
}

.welcome-desc {
  max-width: 520rpx;
  font-size: 30rpx;
  color: var(--color-text-secondary);
  line-height: 1.8;
  opacity: 0.85;
}

/* ===== 消息行 ===== */
.msg-row {
  margin-bottom: 16rpx;
}

.row {
  display: flex;
  padding: 4rpx 0;
  gap: 12rpx;
}

.row-right {
  justify-content: flex-end;
  padding-right: 16rpx;
}

.row-left {
  justify-content: flex-start;
  padding-left: 16rpx;
}

/* ===== AI 头像 ===== */
.ai-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 8rpx;
}

.avatar-text {
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
}

/* ===== 气泡 ===== */
.bubble {
  font-size: 30rpx;
  line-height: 1.5;
  padding: 20rpx 24rpx;
  word-break: break-word;
  max-width: 72%;
  position: relative;
}

.bubble-text {
  display: block;
}

/* 用户气泡 */
.bubble-sent {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: #ffffff;
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl);
  box-shadow: var(--shadow-md);
}

/* AI 气泡 */
.bubble-received {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm);
  border: 1rpx solid var(--color-border-light);
}

/* ===== 打字动画 ===== */
.typing-indicator {
  display: flex;
  gap: 8rpx;
  padding: 8rpx 0 4rpx;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: var(--radius-full);
  background: var(--color-text-tertiary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8rpx);
    opacity: 1;
  }
}

/* ===== 引用来源卡片 ===== */
.sources-row {
  padding: 8rpx 16rpx 8rpx 84rpx;
}

.sources-card {
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: 20rpx 24rpx;
  border: 1rpx solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.sources-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 10rpx;
}

.sources-icon-wrap {
  width: 40rpx;
  height: 40rpx;
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sources-icon {
  font-size: 22rpx;
}

.sources-label {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.source-item {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  gap: 12rpx;
}

.source-index {
  width: 36rpx;
  height: 36rpx;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 20rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.source-name {
  font-size: 26rpx;
  color: var(--color-text-primary);
  line-height: 1.4;
}

/* ===== 操作区 ===== */
.actions-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 16rpx 8rpx 84rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 16rpx;
  border-radius: var(--radius-full);
  background: var(--color-bg);
  border: 1rpx solid var(--color-border);
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: var(--color-bg-tertiary);
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.action-liked {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.action-disliked {
  background: #fef2f2;
  border-color: #fecaca;
}

/* ===== 底部区域 ===== */
.bottom-area {
  flex-shrink: 0;
  background: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 转人工 */
.handoff-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 0 4rpx;
}

.handoff-text {
  font-size: 24rpx;
  color: var(--color-text-tertiary);
}

.handoff-link {
  font-size: 24rpx;
  color: var(--color-primary);
  font-weight: 600;
}

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx 12rpx;
  gap: 12rpx;
  background: var(--color-bg);
}

.input-wrap {
  flex: 1;
  background: var(--color-bg);
  border-radius: var(--radius-full);
  padding: 0 24rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid var(--color-border);
  transition: all 0.2s ease;
}

.input-wrap:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.1);
}

.input {
  width: 100%;
  height: 72rpx;
  font-size: 30rpx;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.input-placeholder {
  color: var(--color-text-tertiary);
  font-size: 30rpx;
}

/* 发送按钮 */
.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  border: 2rpx solid transparent;
}

.send-btn.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-color: transparent;
  box-shadow: var(--shadow-md);
  transform: scale(1.05);
}

.send-btn.active:active {
  transform: scale(0.95);
}

.send-icon {
  color: var(--color-text-tertiary);
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1;
  transition: color 0.2s ease;
}

.send-btn.active .send-icon {
  color: #ffffff;
}

/* ===== Markdown 样式 ===== */
.bubble-markdown {
  display: block;
  line-height: 1.6;
}

/* 段落 */
.bubble-markdown .paragraph {
  margin: 0 0 16rpx 0;
  line-height: 1.6;
}

.bubble-markdown .paragraph:last-child {
  margin-bottom: 0;
}

/* 标题 */
.bubble-markdown .heading {
  font-weight: 700;
  margin: 24rpx 0 12rpx 0;
  line-height: 1.3;
}

.bubble-markdown .heading:first-child {
  margin-top: 0;
}

.bubble-markdown .heading-1 {
  font-size: 36rpx;
}

.bubble-markdown .heading-2 {
  font-size: 32rpx;
}

.bubble-markdown .heading-3 {
  font-size: 30rpx;
}

.bubble-markdown .heading-4 {
  font-size: 28rpx;
}

.bubble-markdown .heading-5 {
  font-size: 26rpx;
}

.bubble-markdown .heading-6 {
  font-size: 24rpx;
}

/* 加粗和斜体 */
.bubble-markdown .bold {
  font-weight: 700;
  display: inline;
}

.bubble-markdown .italic {
  font-style: italic;
  display: inline;
}

.bubble-markdown .strikethrough {
  text-decoration: line-through;
  opacity: 0.7;
  display: inline;
}

/* 行内代码 */
.bubble-markdown .inline-code {
  background: rgba(0, 0, 0, 0.06);
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 26rpx;
  color: #e11d48;
}

/* 代码块 */
.bubble-markdown .code-block {
  background: #1e293b;
  border-radius: var(--radius-md);
  padding: 20rpx 24rpx;
  margin: 16rpx 0;
  overflow-x: auto;
}

.bubble-markdown .code-block .code-content {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 24rpx;
  color: #e2e8f0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 列表 */
.bubble-markdown .unordered-list,
.bubble-markdown .ordered-list {
  margin: 12rpx 0;
  padding-left: 32rpx;
}

.bubble-markdown .unordered-list {
  list-style-type: disc;
}

.bubble-markdown .ordered-list {
  list-style-type: decimal;
}

.bubble-markdown .list-item {
  margin: 8rpx 0;
  line-height: 1.5;
}

.bubble-markdown .list-item::marker {
  color: var(--color-text-tertiary);
}

/* 链接 */
.bubble-markdown .link {
  color: var(--color-primary);
  text-decoration: underline;
  display: inline;
}

/* 图片 */
.bubble-markdown .image-container {
  margin: 12rpx 0;
}

.bubble-markdown .image {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.bubble-markdown .image:active {
  opacity: 0.8;
}

/* 换行 */
.bubble-markdown .line-break {
  height: 16rpx;
}

/* 分隔线 */
.bubble-markdown .divider {
  border: none;
  height: 2rpx;
  background: var(--color-border);
  margin: 24rpx 0;
}

/* 引用 */
.bubble-markdown .blockquote {
  border-left: 6rpx solid var(--color-primary);
  padding: 12rpx 20rpx;
  margin: 16rpx 0;
  background: rgba(37, 99, 235, 0.05);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* 列表项中的段落 */
.bubble-markdown .list-item .paragraph {
  margin: 0;
  display: inline;
}

/* 嵌套列表 */
.bubble-markdown .unordered-list .unordered-list,
.bubble-markdown .ordered-list .ordered-list {
  margin: 4rpx 0;
}

/* 表格 */
.bubble-markdown .markdown-table {
  width: 100%;
  margin: 16rpx 0;
  font-size: 26rpx;
  overflow-x: auto;
}

.bubble-markdown .table-header-row {
  display: flex;
  background: var(--color-bg-tertiary);
}

.bubble-markdown .table-header {
  flex: 1;
  padding: 16rpx 20rpx;
  text-align: left;
  font-weight: 700;
  color: var(--color-text-primary);
  border: 2rpx solid var(--color-border);
  white-space: nowrap;
}

.bubble-markdown .table-body {
  display: flex;
  flex-direction: column;
}

.bubble-markdown .table-row {
  display: flex;
}

.bubble-markdown .table-row:hover .table-cell {
  background: var(--color-bg-secondary);
}

.bubble-markdown .table-cell {
  flex: 1;
  padding: 14rpx 20rpx;
  border: 2rpx solid var(--color-border);
  color: var(--color-text-secondary);
  vertical-align: top;
}

/* ===== 语法高亮样式 ===== */
.bubble-markdown .hl-keyword {
  color: #c678dd;
  font-weight: 600;
}

.bubble-markdown .hl-builtin {
  color: #61afef;
}

.bubble-markdown .hl-string {
  color: #98c379;
}

.bubble-markdown .hl-comment {
  color: #5c6370;
  font-style: italic;
}

.bubble-markdown .hl-number {
  color: #d19a66;
}

.bubble-markdown .hl-operator {
  color: #56b6c2;
}

.bubble-markdown .hl-punctuation {
  color: #abb2bf;
}

/* ===== 任务列表样式 ===== */
.bubble-markdown .task-list {
  list-style: none;
  padding-left: 8rpx;
  margin: 12rpx 0;
}

.bubble-markdown .task-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin: 8rpx 0;
  line-height: 1.5;
}

.bubble-markdown .task-checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid var(--color-border);
  border-radius: 6rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
  background: var(--color-bg);
}

.bubble-markdown .task-checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  position: relative;
}

.bubble-markdown .task-checkbox.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
}

.bubble-markdown .task-content {
  flex: 1;
}

.bubble-markdown .task-content.completed {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

/* ===== LaTeX 公式样式 ===== */
.bubble-markdown .latex-inline {
  display: inline;
  padding: 2rpx 6rpx;
  background: rgba(37, 99, 235, 0.05);
  border-radius: 4rpx;
  font-family: 'Times New Roman', 'Georgia', serif;
  font-style: italic;
}

.bubble-markdown .latex-block {
  display: block;
  padding: 20rpx 24rpx;
  margin: 16rpx 0;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
  font-family: 'Times New Roman', 'Georgia', serif;
  font-size: 30rpx;
  overflow-x: auto;
}

.bubble-markdown .latex-fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0 4rpx;
}

.bubble-markdown .latex-numerator {
  border-bottom: 2rpx solid var(--color-text-primary);
  padding: 4rpx 8rpx 2rpx;
  font-size: 24rpx;
}

.bubble-markdown .latex-denominator {
  padding: 2rpx 8rpx 4rpx;
  font-size: 24rpx;
}

.bubble-markdown .latex-sqrt {
  display: inline-flex;
  align-items: center;
}

.bubble-markdown .latex-sqrt::before {
  content: '√';
  font-size: 36rpx;
  margin-right: 4rpx;
}

.bubble-markdown .latex-sqrt-index {
  font-size: 20rpx;
  vertical-align: super;
  margin-right: 4rpx;
}

.bubble-markdown .latex-sqrt-content {
  border-top: 2rpx solid var(--color-text-primary);
  padding: 4rpx 8rpx;
}

.bubble-markdown .latex-subscript {
  font-size: 20rpx;
  vertical-align: sub;
}

.bubble-markdown .latex-superscript {
  font-size: 20rpx;
  vertical-align: super;
}

.bubble-markdown .latex-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  font-style: normal;
}
</style>
