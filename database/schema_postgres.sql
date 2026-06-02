-- =====================================================================
-- 智能客服助手 业务后端数据库 (PostgreSQL)
-- 对应技术方案第 9 节：后端落库字段
-- 与 TypeORM 实体保持一致。生产环境建议用迁移管理，开发期可直接执行本文件。
-- =====================================================================

CREATE DATABASE ai_customer_service;
\c ai_customer_service;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- 用户 ----------
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    openid      VARCHAR(64) NOT NULL,
    unionid     VARCHAR(64),
    nickname    VARCHAR(64),
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uniq_users_openid ON users (openid);

-- ---------- 会话 ----------
CREATE TABLE conversations (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                VARCHAR(64) NOT NULL,
    dify_conversation_id   VARCHAR(64),                 -- Dify 侧会话 ID，首条消息后回填
    scene                  VARCHAR(32) NOT NULL DEFAULT 'default',
    title                  VARCHAR(128),
    handoff                BOOLEAN NOT NULL DEFAULT FALSE, -- 是否转人工
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conv_user ON conversations (user_id);
CREATE INDEX idx_conv_dify ON conversations (dify_conversation_id);

-- ---------- 问答日志（一问一答）----------
CREATE TABLE qa_messages (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               VARCHAR(64) NOT NULL,
    conversation_id       VARCHAR(64) NOT NULL,
    dify_message_id       VARCHAR(64),                  -- 反馈时用
    question              TEXT NOT NULL,
    answer                TEXT,
    retriever_resources   JSONB,                        -- 引用文档/检索片段
    latency_ms            INTEGER NOT NULL DEFAULT 0,   -- 耗时
    total_tokens          INTEGER NOT NULL DEFAULT 0,   -- token 消耗
    feedback              INTEGER NOT NULL DEFAULT 0,   -- 1=有用 -1=无用 0=未反馈
    status                VARCHAR(16) NOT NULL DEFAULT 'success', -- success / error
    error_message         TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_user ON qa_messages (user_id);
CREATE INDEX idx_msg_conv ON qa_messages (conversation_id);
CREATE INDEX idx_msg_dify ON qa_messages (dify_message_id);
CREATE INDEX idx_msg_created ON qa_messages (created_at);

-- =====================================================================
-- 可用于运营分析的示例查询（对应方案第 9 节）：
--   高频问题、命中率、转人工率、平均耗时等
-- =====================================================================
-- 高频问题 TOP 20：
--   SELECT question, COUNT(*) c FROM qa_messages GROUP BY question ORDER BY c DESC LIMIT 20;
-- 无用反馈率（潜在知识库缺口）：
--   SELECT COUNT(*) FILTER (WHERE feedback = -1)::float / NULLIF(COUNT(*) FILTER (WHERE feedback <> 0),0) FROM qa_messages;
-- 转人工率：
--   SELECT COUNT(*) FILTER (WHERE handoff)::float / COUNT(*) FROM conversations;
-- 平均响应耗时：
--   SELECT AVG(latency_ms) FROM qa_messages WHERE status = 'success';
