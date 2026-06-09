# 小程序智能客服助手

一个基于 Dify 与本地知识库的微信小程序智能客服助手：用户在小程序里提问，由 RAG 检索知识库后给出带引用来源的回答，并支持转人工。

采用「小程序 → 业务后端 → Dify → 在线/本地模型 + 知识库」四层架构，
小程序不直接访问 Dify，由后端统一鉴权、转发、日志、限流、安全隔离。

```
微信小程序前端 (uni-app)
      ↓ HTTPS
业务后端 (NestJS)  ← 保存 Dify Key、鉴权、日志、限流、敏感词、转人工
      ↓ 内网 HTTP
Dify（Docker 本地部署）
      ↓
在线模型 / 本地模型 + 知识库 / 向量库
```

## 环境要求

- **Node.js** ≥ 18（后端 NestJS 10）
- **Docker** + **Docker Compose**（部署数据库与 Dify）
- **HBuilderX**（编译运行小程序；uni-app 源码不能直接拖进微信开发者工具）
- **微信开发者工具**（模拟器调试与上传）

## 启动顺序

1. **数据库**：`cd database && docker compose up -d`（首次启动自动建表），
   或手动执行 `database/schema_postgres.sql` / `schema_mysql.sql`。
2. **Dify**：确认本地 Docker 的 Dify 已运行，并在目标应用「访问 API」页生成 App API Key
   （详见下方 [Dify 部署（Docker）](#dify-部署docker)）。
3. **后端**：进入 `backend/`，`cp .env.example .env` 填好 `DIFY_API_KEY` 与数据库，
   `npm install && npm run start:dev`（默认 `http://localhost:3000/api`）。
4. **小程序**：进入 `miniapp/`，在 `api/config.js` 中根据场景设置 `isDev`：

   | 场景 | `isDev` | `BASE_URL` |
   |------|---------|------------|
   | 开发者工具调试 | `true` | `http://localhost:3000/api` |
   | 真机调试 / 体验版 | `false` | `https://你的域名/api` |

   用 HBuilderX 打开 `miniapp/` 目录后「运行到小程序模拟器 → 微信开发者工具」。

## Dify 部署（Docker）

前提：已安装 Docker 与 Docker Compose（`docker compose version` 可查）。

1. **拉取并启动**

   ```bash
   git clone https://github.com/langgenius/dify.git
   cd dify/docker
   cp .env.example .env
   docker compose up -d
   ```

   默认通过 Nginx 的 **80 端口**对外暴露；若端口冲突，可在 `dify/docker/.env`
   中修改 `EXPOSE_NGINX_PORT` 后重新 `docker compose up -d`。
   查看容器状态：`docker compose ps`。

2. **初始化管理员**：浏览器打开 `http://localhost/install` 设置管理员邮箱与密码，
   之后从 `http://localhost` 登录控制台。

3. **配置模型**：控制台右上头像 → **设置 → 模型供应商**，至少配置一个
   **对话模型** + 一个 **Embedding 模型**（知识库向量化用）。两种接法见下方
   [模型配置（在线模型 / Ollama 本地模型）](#模型配置在线模型--ollama-本地模型)。

4. **建知识库（RAG，可选）**：**知识库 → 创建 → 上传文档 →
   选择 Embedding 模型 → 等待索引完成**。

5. **创建应用并发布**：**工作室 → 创建应用**（聊天助手 / Chatflow）→
   在编排页关联上面的模型与知识库 → 右上角 **「发布」**。

6. **生成 API Key**：进入该应用 → 左侧 **「访问 API」→ 「API 密钥」**，
   生成 `app-xxxx`，连同服务地址填进 `backend/.env`：

   ```ini
   DIFY_API_BASE_URL=http://localhost/v1   # 本机默认；端口改过则同步修改
   DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

   > 网络说明：后端与 Dify 在**同一台宿主机**时用 `http://localhost/v1` 即可；
   > 若后端也跑在容器里，需改用 Dify 的容器名或网关 IP，例如 `http://docker-nginx-1/v1`。

7. **验证连通**（可选）：

   ```bash
   curl -X POST http://localhost/v1/chat-messages \
     -H "Authorization: Bearer app-xxxx" \
     -H "Content-Type: application/json" \
     -d '{"inputs":{},"query":"你好","response_mode":"blocking","user":"test"}'
   ```

   能返回 JSON 格式的回答即表示 Dify 已就绪，后端即可正常转包
   `POST /v1/chat-messages`。

### 模型配置（在线模型 / Ollama 本地模型）

对应上面的第 3 步，二选一即可；无论哪种，都要同时配一个**对话模型**和一个 **Embedding 模型**。

#### 方式 A：在线模型（最快上手）

1. **设置 → 模型供应商**，选择供应商（OpenAI / Gemini / DeepSeek / 通义千问 等），填入其 **API Key**。
2. 选用该供应商的 **Embedding 模型**（如通义 `text-embedding-v3`、OpenAI `text-embedding-3-small`）供知识库使用。

> 优点：无需本地算力、开箱即用；缺点：按量付费、数据出网。

#### 方式 B：Ollama 本地模型（离线、免费）

1. **安装并启动 Ollama**（[官网](https://ollama.com) 下载 App 或 `brew install ollama`），
   默认在 `127.0.0.1:11434` 后台运行。

2. **拉取模型**（至少一个对话 + 一个 Embedding）：

   ```bash
   ollama pull qwen2.5:7b      # 对话模型，按机器配置可选 1.5b/3b/7b/14b
   ollama pull bge-m3          # Embedding 模型
   ```

3. **让 Ollama 监听所有网卡**（关键，否则 Docker 里的 Dify 连不上）：

   ```bash
   launchctl setenv OLLAMA_HOST "0.0.0.0:11434"   # macOS
   ```

   设完后**完全退出并重启 Ollama**（App 用户：菜单栏图标 → Quit 再重开）。验证：

   ```bash
   curl http://localhost:11434/api/tags    # 能列出已拉取的模型即可
   ```

4. **在 Dify 添加 Ollama 模型**：**设置 → 模型供应商 → Ollama → 添加模型**，
   分别添加对话模型与 Embedding 模型：

   | 字段 | 对话模型 | Embedding 模型 |
   |------|----------|----------------|
   | 模型类型 | LLM | Text Embedding |
   | 模型名称 | `qwen2.5:7b`（须与 `ollama list` 完全一致） | `bge-m3` |
   | 基础 URL | `http://host.docker.internal:11434` | `http://host.docker.internal:11434` |
   | API 密钥 | 留空 | 留空 |
   | 模型类型（对话/补全） | 对话 | — |
   | 模型上下文长度 | `32768`（内存小填 `8192`） | — |
   | 最大 token 上限 | `4096` | — |
   | Vision / 函数调用 | 否 / 否 | — |

   > - **connection / Max retries** 报错：多半是没设 `OLLAMA_HOST=0.0.0.0`，回第 3 步重启 Ollama。
   > - **model not found** 报错：「模型名称」和 `ollama list` 对不上，注意标签与大小写。
   > - Linux 服务器上 `host.docker.internal` 默认不可用，需在 Dify 的 compose 里加
   >   `extra_hosts: ["host.docker.internal:host-gateway"]`，或改用宿主机内网 IP。

> ⚠️ **更换 Embedding 模型需重建知识库**：在线与本地（或不同 Embedding）向量空间不同，
> 切换后必须对已有文档**重新索引**，否则检索结果错乱。

## 真机调试 / 体验版（可选）

在 [启动顺序](#启动顺序) 基础上还需：

- 后端通过 Cloudflare Tunnel 或 Nginx 暴露到公网 **HTTPS** 域名。
- `miniapp/api/config.js` 的 `isDev` 设为 `false`，`BASE_URL` 填实际域名。
- 微信公众平台 → 开发管理 → 开发设置 → 服务器域名，添加 `https://你的域名`。
- `miniapp/manifest.json` 的 `mp-weixin.appid` 填正式 AppID。

## 相关文档

详细说明见各子目录的 `README.md`。
