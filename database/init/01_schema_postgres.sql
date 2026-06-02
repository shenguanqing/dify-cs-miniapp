-- Docker 初始化脚本：仅建表（数据库由 compose 的 POSTGRES_DB 创建，本脚本已连接到该库）。
-- 与 backend 的 TypeORM 实体保持一致。
-- 若手动在已有库执行，请先 \c ai_customer_service 再运行本文件。

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- 用户 ----------
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    openid      VARCHAR(64) NOT NULL,
    unionid     VARCHAR(64),
    nickname    VARCHAR(64),
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_users_openid ON users (openid);

-- ---------- 会话 ----------
CREATE TABLE IF NOT EXISTS conversations (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                VARCHAR(64) NOT NULL,
    dify_conversation_id   VARCHAR(64),
    scene                  VARCHAR(32) NOT NULL DEFAULT 'default',
    title                  VARCHAR(128),
    handoff                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_conv_dify ON conversations (dify_conversation_id);

-- ---------- 问答日志 ----------
CREATE TABLE IF NOT EXISTS qa_messages (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               VARCHAR(64) NOT NULL,
    conversation_id       VARCHAR(64) NOT NULL,
    dify_message_id       VARCHAR(64),
    question              TEXT NOT NULL,
    answer                TEXT,
    retriever_resources   JSONB,
    latency_ms            INTEGER NOT NULL DEFAULT 0,
    total_tokens          INTEGER NOT NULL DEFAULT 0,
    feedback              INTEGER NOT NULL DEFAULT 0,
    status                VARCHAR(16) NOT NULL DEFAULT 'success',
    error_message         TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msg_user ON qa_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON qa_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_dify ON qa_messages (dify_message_id);
CREATE INDEX IF NOT EXISTS idx_msg_created ON qa_messages (created_at);
