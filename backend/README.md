# 业务后端（NestJS）

转包 Dify Chat API，为微信小程序提供智能客服接口。小程序不直接访问 Dify，
所有 Dify API Key、内网地址都只保存在本服务。

## 技术栈

- NestJS 10 + TypeScript
- TypeORM（PostgreSQL / MySQL 可切换）
- JWT 鉴权（微信 `code` 登录）
- `@nestjs/throttler` 限流
- axios 调用 Dify

## 目录结构

```
src/
├─ main.ts                      启动入口（全局前缀、CORS、统一响应/异常）
├─ app.module.ts                根模块（配置、限流、数据库）
├─ common/
│  ├─ interceptors/             统一响应包装 { code, message, data }
│  ├─ filters/                  全局异常兜底（Dify 异常 -> 提示转人工）
│  └─ decorators/               @CurrentUser 取登录用户
├─ database/entities/           User / Conversation / QaMessage 实体
└─ modules/
   ├─ auth/                     微信登录、JWT、AuthGuard
   └─ ai/                       Dify 客户端、问答编排、6 个接口、SSE 流式
```

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 小程序 `code` 换 token |
| POST | `/api/ai/chat` | 发送问题（`stream:false` 阻塞 / `true` SSE 流式）|
| POST | `/api/ai/conversation/new` | 新建会话 |
| GET  | `/api/ai/history?conversationId=` | 历史消息 |
| POST | `/api/ai/feedback` | 用户反馈（有用/无用，透传 Dify）|
| POST | `/api/ai/handoff` | 转人工 |
| GET  | `/api/ai/config` | 前端配置（欢迎语、场景等）|

除 `auth/login` 外，AI 接口均需 `Authorization: Bearer <token>`。

## 快速开始

```bash
cd backend
cp .env.example .env       # 填好 DIFY_API_KEY、数据库等
npm install
npm run start:dev          # http://localhost:3000/api
```

### 必填环境变量

- `DIFY_API_BASE_URL`：Dify 应用 API 地址，本机 Docker 默认 `http://localhost/v1`
- `DIFY_API_KEY`：在 Dify 应用「访问 API」页生成的 `app-xxxx`
- 数据库 `DB_*`：先执行 `database/` 下的建表脚本，或开发期设 `DB_SYNCHRONIZE=true` 自动建表
- 微信 `WX_APPID` / `WX_SECRET`：未配置时走本地 mock 登录，便于先联调

## 与 Dify 的对接

`src/modules/ai/dify.client.ts` 封装：

- `POST /v1/chat-messages`（blocking / streaming 两种模式）
- `POST /v1/messages/{id}/feedbacks`（点赞/点踩）

Dify 返回的 `conversation_id` 会在首条消息后回填到本地会话，后续提问自动带上以保持上下文。
检索到的 `retriever_resources`（引用文档片段）会落库并返回给前端展示「参考来源」。

## 流式说明

阻塞模式（默认）最省心：后端拿到完整答案返回，前端用打字机效果呈现。
若要真正的 SSE 流式（`stream:true`），小程序端需开启 `wx.request` 的 `enableChunked`
并处理 `onChunkReceived`，对基础库版本有要求。生产可先用阻塞模式上线。
