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
page {
  background-color: #f2f2f7;
  height: 100%;
  overflow: hidden;
}
</style>
