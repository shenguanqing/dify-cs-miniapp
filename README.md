# 小程序智能客服助手

采用「小程序 → 业务后端 → Dify → 本地模型/知识库」四层架构，
小程序不直接访问 Dify，由后端统一鉴权、转发、日志、限流、安全隔离。

```
微信小程序前端 (uni-app)
      ↓ HTTPS
业务后端 (NestJS)  ← 保存 Dify Key、鉴权、日志、限流、敏感词、转人工
      ↓ 内网 HTTP
Dify（你已用 Docker 本地部署）
      ↓
本地模型 / 知识库 / 向量库
```

## 启动顺序

1. **数据库**：执行 `database/schema_postgres.sql`（或 `schema_mysql.sql`）建库建表。
2. **Dify**：确认本地 Docker 的 Dify 已运行，并在目标应用「访问 API」页生成 App API Key。
3. **后端**：进入 `backend/`，`cp .env.example .env` 填好 `DIFY_API_KEY` 与数据库，
   `npm install && npm run start:dev`（默认 `http://localhost:3000/api`）。
4. **小程序**：进入 `miniapp/`，在 `api/config.js` 配好后端地址，
   用 HBuilderX 打开该目录后「运行到小程序模拟器 -> 微信开发者工具」
   （uni-app 源码需经 HBuilderX 编译，不能直接拖进微信开发者工具）。

详细说明见各子目录的 `README.md`。
