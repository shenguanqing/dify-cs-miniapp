<script>
import { ensureLogin } from './api/auth';

export default {
  onLaunch: function () {
    ensureLogin()
      .then(() => console.log('[App] 登录流程完成，开始使用'))
      .catch((e) => {
        console.error('[App] 登录失败，详情:', JSON.stringify(e));
        uni.showToast({
          title: typeof e === 'object' && e.message ? e.message : '登录失败',
          icon: 'none',
          duration: 3000,
        });
      });
  },
};
</script>

<style>
/* ===== 全局重置和基础样式 ===== */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 28rpx;
  line-height: 1.5;
  color: #0f172a;
  background-color: #ffffff;
  height: 100%;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== 全局组件样式 ===== */
view {
  box-sizing: border-box;
}

text {
  box-sizing: border-box;
}

/* ===== 隐藏滚动条 ===== */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* ===== 全局动画 ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 全局工具类 ===== */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-up {
  animation: slideUp 0.4s ease-out;
}

/* ===== Toast 样式覆盖 ===== */
.uni-toast {
  border-radius: 12rpx !important;
}

.uni-toast__content {
  font-size: 28rpx !important;
  padding: 20rpx 32rpx !important;
}

/* ===== Modal 样式覆盖 ===== */
.uni-modal {
  border-radius: 16rpx !important;
  overflow: hidden;
}

.uni-modal__hd {
  padding: 32rpx 32rpx 16rpx !important;
}

.uni-modal__title {
  font-size: 32rpx !important;
  font-weight: 600 !important;
  color: #0f172a !important;
}

.uni-modal__bd {
  padding: 16rpx 32rpx 32rpx !important;
  font-size: 28rpx !important;
  color: #475569 !important;
  line-height: 1.5 !important;
}

.uni-modal__ft {
  height: 88rpx !important;
  line-height: 88rpx !important;
}

.uni-modal__btn {
  font-size: 30rpx !important;
  font-weight: 600 !important;
  color: #2563eb !important;
}
</style>
