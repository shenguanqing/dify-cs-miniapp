-- =====================================================================
-- 智能客服助手 业务后端数据库 (MySQL 8.0+)
-- 对应技术方案第 9 节。与 TypeORM 实体保持一致。
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ai_customer_service
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_customer_service;

-- ---------- 用户 ----------
CREATE TABLE users (
    id          CHAR(36) PRIMARY KEY,
    openid      VARCHAR(64) NOT NULL,
    unionid     VARCHAR(64) NULL,
    nickname    VARCHAR(64) NULL,
    enabled     TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_users_openid (openid)
) ENGINE=InnoDB;

-- ---------- 会话 ----------
CREATE TABLE conversations (
    id                     CHAR(36) PRIMARY KEY,
    user_id                VARCHAR(64) NOT NULL,
    dify_conversation_id   VARCHAR(64) NULL,
    scene                  VARCHAR(32) NOT NULL DEFAULT 'default',
    title                  VARCHAR(128) NULL,
    handoff                TINYINT(1) NOT NULL DEFAULT 0,
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_conv_user (user_id),
    KEY idx_conv_dify (dify_conversation_id)
) ENGINE=InnoDB;

-- ---------- 问答日志 ----------
CREATE TABLE qa_messages (
    id                    CHAR(36) PRIMARY KEY,
    user_id               VARCHAR(64) NOT NULL,
    conversation_id       VARCHAR(64) NOT NULL,
    dify_message_id       VARCHAR(64) NULL,
    question              TEXT NOT NULL,
    answer                TEXT NULL,
    retriever_resources   JSON NULL,
    latency_ms            INT NOT NULL DEFAULT 0,
    total_tokens          INT NOT NULL DEFAULT 0,
    feedback              INT NOT NULL DEFAULT 0,
    status                VARCHAR(16) NOT NULL DEFAULT 'success',
    error_message         TEXT NULL,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_msg_user (user_id),
    KEY idx_msg_conv (conversation_id),
    KEY idx_msg_dify (dify_message_id),
    KEY idx_msg_created (created_at)
) ENGINE=InnoDB;
