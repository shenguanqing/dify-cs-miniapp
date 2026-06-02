# 小程序前端（uni-app + Vue3，HBuilderX 标准项目）

只负责聊天体验：聊天窗口、输入框、历史消息、正在回复、打字机效果、复制、
反馈（有用/无用）、转人工入口。不保存任何 Dify Key 或服务器内部地址，
只访问业务后端。

## 目录结构（文件在项目根目录，供 HBuilderX 直接打开）

```
miniapp/
├─ main.js                 入口
├─ App.vue                 启动时静默登录
├─ pages.json              页面路由
├─ manifest.json           小程序配置（填 appid）
├─ api/
│  ├─ config.js            后端地址、是否流式
│  ├─ request.js           uni.request 统一封装 + token
│  ├─ auth.js              wx.login -> 后端换 token
│  └─ chat.js              聊天相关接口
└─ pages/chat/chat.vue     聊天主界面
```

## 运行（HBuilderX）

uni-app 源码不能直接拖进微信开发者工具——必须用 HBuilderX 编译。步骤：

1. 下载安装 **HBuilderX**（DCloud 官方，App 开发版）。
2. HBuilderX 菜单「文件 -> 打开目录」，选择本 `miniapp` 文件夹。
3. 打开 `manifest.json`，在「微信小程序配置」里填入你的小程序 **AppID**
   （没有的话可先用测试号，或在微信开发者工具里用测试账号）。
4. 顶部菜单「运行 -> 运行到小程序模拟器 -> 微信开发者工具」。
   HBuilderX 会自动把源码编译成原生小程序，并拉起微信开发者工具打开编译产物。

> 首次运行需在 HBuilderX「工具 -> 设置 -> 运行配置」里指定微信开发者工具的安装路径。
> 微信开发者工具需开启「安全 -> 服务端口」，否则 HBuilderX 无法自动拉起。

## 配置后端地址

编辑 `api/config.js` 的 `BASE_URL`：

- 本地联调：`http://localhost:3000/api`，并在微信开发者工具
  「详情 -> 本地设置」勾选「不校验合法域名」。
- 真机 / 上线：必须是已备案的 HTTPS 域名，并在小程序后台
  「开发管理 -> 服务器域名」配置 request 合法域名。

## 登录说明

启动即 `wx.login()` 拿 `code`，调用后端 `/api/auth/login` 换取 token 存本地。
后端未配置微信 AppID/Secret 时会走 mock 登录，方便先把链路跑通。
