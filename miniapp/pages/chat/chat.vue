<template>
  <view class="chat-page">
    <!-- 消息列表 -->
    <scroll-view
      class="msg-list"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      :show-scrollbar="false"
    >
      <!-- 欢迎卡片 -->
      <view class="welcome-card" v-if="messages.length === 0">
        <view class="welcome-icon">AI</view>
        <view class="welcome-title">智能客服助手</view>
        <view class="welcome-desc">{{ config.welcome || '您好，有什么可以帮您？' }}</view>
      </view>

      <view v-for="(m, idx) in messages" :key="idx" class="msg-row">
        <!-- 用户气泡（iMessage 蓝色，右侧）-->
        <view v-if="m.role === 'user'" class="row row-right">
          <view class="bubble bubble-sent">{{ m.content }}</view>
        </view>

        <!-- AI 气泡（iMessage 灰色，左侧）-->
        <view v-else class="row row-left">
          <view class="bubble bubble-received">
            <text>{{ m.content }}</text>
            <text v-if="m.typing" class="typing-dots">
              <text class="dot dot1">.</text><text class="dot dot2">.</text><text class="dot dot3">.</text>
            </text>
          </view>
        </view>

        <!-- 引用来源 -->
        <view v-if="m.role === 'ai' && !m.typing && m.sources && m.sources.length" class="sources-row">
          <view class="sources-card">
            <view class="sources-header">
              <text class="sources-icon">📄</text>
              <text class="sources-label">参考来源</text>
            </view>
            <view v-for="(s, i) in m.sources" :key="i" class="source-item">
              <text class="source-dot">{{ i + 1 }}</text>
              <text class="source-name">{{ s.documentName || '文档片段' }}</text>
            </view>
          </view>
        </view>

        <!-- 操作区（仅 AI 消息且非输入中时显示）-->
        <view v-if="m.role === 'ai' && !m.typing && m.content" class="actions-row">
          <view class="action-btn" @tap="copyText(m.content)">
            <text class="action-icon">📋</text>
            <text class="action-text">复制</text>
          </view>
          <view class="action-btn" :class="{ liked: m.feedback === 1 }" @tap="feedback(m, 1)">
            <text class="action-icon">👍</text>
          </view>
          <view class="action-btn" :class="{ disliked: m.feedback === -1 }" @tap="feedback(m, -1)">
            <text class="action-icon">👎</text>
          </view>
        </view>
      </view>

      <!-- 底部留白，防止最后一条消息被输入框遮挡 -->
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 底部区域：转人工 + 输入框，固定在底部 -->
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
} from '../../api/chat';

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
    };
  },
  async onLoad() {
    try {
      await ensureLogin();
      this.config = await getConfig();
      const conv = await newConversation(this.scene);
      this.conversationId = conv.conversationId;
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
        aiMsg.messageId = data.messageId;
        aiMsg.sources = data.sources || [];
        await this.typeWriter(aiMsg, data.answer || '（暂无回答）');
      } catch (e) {
        aiMsg.typing = false;
        aiMsg.content = e.message || '智能客服繁忙，请稍后再试或转人工';
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
/* ===== 全局 ===== */
page {
  background-color: #f2f2f7;
  height: 100%;
  overflow: hidden;
}

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f2f2f7;
  overflow: hidden;
}

/* ===== 消息列表 ===== */
.msg-list {
  flex: 1;
  padding: 16rpx 20rpx 0;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 隐藏滚动条（微信小程序专用） */
.msg-list ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.bottom-spacer {
  height: 20rpx;
}

/* ===== 欢迎卡片 ===== */
.welcome-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 60rpx 0 40rpx;
  padding: 48rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}
.welcome-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #5e5ce6, #bf5af2);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}
.welcome-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1c1c1e;
  margin-bottom: 12rpx;
}
.welcome-desc {
  font-size: 26rpx;
  color: #8e8e93;
  text-align: center;
  line-height: 1.5;
}

/* ===== 消息行 ===== */
.msg-row {
  margin-bottom: 8rpx;
}

.row {
  display: flex;
  padding: 2rpx 0;
}
.row-right {
  justify-content: flex-end;
  padding-right: 8rpx;
}
.row-left {
  justify-content: flex-start;
  padding-left: 8rpx;
}

/* ===== 气泡（iMessage 风格）===== */
.bubble {
  font-size: 30rpx;
  line-height: 1.45;
  padding: 16rpx 24rpx;
  word-break: break-word;
  max-width: 75%;
}

/* 发送（蓝色）*/
.bubble-sent {
  background: #007aff;
  color: #fff;
  border-radius: 24rpx 24rpx 6rpx 24rpx;
}

/* 接收（灰色）*/
.bubble-received {
  background: #e9e9eb;
  color: #1c1c1e;
  border-radius: 24rpx 24rpx 24rpx 6rpx;
}

/* 打字动画 */
.typing-dots {
  display: inline-flex;
}
.dot {
  color: #8e8e93;
  font-weight: bold;
  font-size: 36rpx;
  animation: bounce 1.2s infinite;
}
.dot1 { animation-delay: 0s; }
.dot2 { animation-delay: 0.2s; }
.dot3 { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

/* ===== 引用来源卡片 ===== */
.sources-row {
  padding: 4rpx 8rpx 4rpx 56rpx;
}
.sources-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 18rpx 22rpx;
  box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);
}
.sources-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.sources-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}
.sources-label {
  font-size: 22rpx;
  color: #8e8e93;
  font-weight: 500;
}
.source-item {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}
.source-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #f2f2f7;
  color: #8e8e93;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  flex-shrink: 0;
}
.source-name {
  font-size: 24rpx;
  color: #48484a;
}

/* ===== 操作区 ===== */
.actions-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 6rpx 8rpx 6rpx 56rpx;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
}
.action-icon {
  font-size: 22rpx;
}
.action-text {
  font-size: 22rpx;
  color: #8e8e93;
}
.action-btn.liked {
  background: #e8f5e9;
}
.action-btn.disliked {
  background: #fce4ec;
}

/* ===== 底部区域（固定）===== */
.bottom-area {
  flex-shrink: 0;
  background: #f2f2f7;
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
  font-size: 22rpx;
  color: #8e8e93;
}
.handoff-link {
  font-size: 22rpx;
  color: #007aff;
}

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: flex-end;
  padding: 12rpx 20rpx 12rpx;
  gap: 12rpx;
}

.input-wrap {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 0 24rpx;
  min-height: 72rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
}
.input {
  width: 100%;
  height: 72rpx;
  font-size: 28rpx;
  color: #1c1c1e;
}
.input-placeholder {
  color: #aeaeb2;
}

/* 发送按钮（iMessage 蓝色圆圈）*/
.send-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #c7c7cc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.send-btn.active {
  background: #007aff;
}
.send-icon {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1;
}
</style>
