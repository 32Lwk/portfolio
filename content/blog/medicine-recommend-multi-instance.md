---
title: マルチインスタンス対応の実装 - PostgreSQLベースのセッション管理システム
description: >-
  Render Manual
  Scaling対応のため、PostgreSQLベースのセッション管理システムを実装し、複数インスタンス間でセッションデータを共有する機能について
date: '2025-11-05'
category: プロジェクト
tags:
  - 医薬品相談ツール
  - PostgreSQL
  - パフォーマンス
author: 川嶋宥翔
featured: false
hidden: false
---

# マルチインスタンス対応の実装 - PostgreSQLベースのセッション管理システム

Render Manual Scaling対応のため、PostgreSQLベースのセッション管理システムを実装しました。この記事では、複数インスタンス間でセッションデータを共有する機能の実装と、開発を通じて学んだことについて解説します。

## 開発の背景

### Render Manual Scalingの課題

[medicine-recommend-system](https://github.com/32Lwk/medicine-recommend-system) では、Render Manual Scalingを使用する場合に複数のインスタンスが起動します。しかし、Flaskのデフォルトのセッション管理（メモリベース）では、**インスタンス間でセッションデータが共有されない**という問題がありました。同じユーザーが別リクエストで別インスタンスに振られると、会話履歴やユーザー属性が引き継がれず、体験が分断されます。

### 解決のアプローチ

PostgreSQLベースのセッション管理システムを実装し、複数インスタンス間でセッションデータを共有できるようにしました。READMEでは、**2〜3台のインスタンスで同時接続15台に対応**できる構成として言及されています。

## 実装の詳細（GitHub 本番ブランチとの対応）

現在の [medicine-recommend-system](https://github.com/32Lwk/medicine-recommend-system) では、セッションとグローバル状態は **`src/services/database.py`**（DatabaseManager）と **`src/services/session_manager.py`** で扱っています。テーブル作成は起動時の `initialize_tables()` で行われます。

### 1. セッション・グローバル状態テーブル（database.py）

```python
# src/services/database.py の initialize_tables() より抜粋
create_sessions_table_sql = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255),
    messages JSONB,
    user_attributes JSONB,
    last_activity TIMESTAMP NOT NULL,
    client_ip VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_active BOOLEAN DEFAULT TRUE
);
"""

create_global_state_table_sql = """
CREATE TABLE IF NOT EXISTS global_state (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""
```

インデックスは `idx_sessions_last_activity`、`idx_global_state_updated_at` などが定義されています。

### 2. セッションの保存と取得（session_manager.py → database.py）

アプリからは **`session_manager`** の API を利用します。内部で `get_database()` により DatabaseManager を取得し、`db.save_session` / `db.get_session` を呼びます。

```python
# src/services/session_manager.py
def get_session_from_db(session_id):
    """セッションをDBから取得、失敗時はメモリフォールバック"""
    db = get_database()
    if db and (db.connection or db.connection_pool):
        session_data = db.get_session(session_id)
        if session_data:
            return session_data
    return _all_sessions.get(session_id)

def save_session_to_db(session_id, data):
    """セッションをDBに保存、失敗時はメモリに保存"""
    db = get_database()
    if db and (db.connection or db.connection_pool):
        success = db.save_session(session_id, data)
        if success:
            return True
    _all_sessions[session_id] = data
    logger.warning(f"DB save failed, using memory fallback for session {session_id}")
    return True
```

### 3. グローバル状態の同期（global_state テーブル）

**AI_AUTO_REPLY**・**ADMIN_MODE**・**MANUAL_REPLY_QUEUE**・**MANUAL_REPLY_MESSAGE** は、`global_state` テーブルの key/value（JSONB）で管理されています。`session_manager` からは次のように取得・設定します。

```python
# src/services/session_manager.py
def get_manual_reply_queue():
    """手動返信キューをDBから取得"""
    db = get_database()
    if db and (db.connection or db.connection_pool):
        return db.get_global_state('MANUAL_REPLY_QUEUE', default_value=[])
    return _manual_reply_queue

def set_manual_reply_queue(value):
    """手動返信キューをDBに保存"""
    global _manual_reply_queue
    db = get_database()
    if db and (db.connection or db.connection_pool):
        db.set_global_state('MANUAL_REPLY_QUEUE', value)
    _manual_reply_queue = value
```

### 4. 自動フォールバック

DB 接続が利用できない場合は、モジュール変数 `_all_sessions` や `_manual_reply_queue` などにフォールバックし、単一インスタンスとして動作し続ける設計です。

## 運用で気づいたこと（README・本番環境に基づく）

- **フォールバックの動作**: DB接続失敗時は `session_manager` 内でメモリフォールバックし、`logger.warning("DB save failed, using memory fallback for session ...")` がログに出力されます。本番ではDB（Neon PostgreSQL）を利用しているため、接続が一時的に不安定になった場合にのみフォールバックが発生し得ます。ログでフォールバックの有無を確認し、Neonの接続制限やネットワークを確認する運用にしています。
- **Render Manual Scaling 時**: 2026年2月にGCP Cloud Runへ移行する前は、Render で2〜3台のインスタンスを立てた構成で、PostgreSQL（当時はCloud SQL）にセッションとグローバル状態を置くことで、同一ユーザーが別インスタンスに振られても会話履歴や手動返信キューが引き継がれることを確認しました。インスタンス間でセッションが分断される事象は、DB共有の導入後に解消しています。
- **Cloud Run 移行後**: 2026年2月に [GCP Cloud Run・Neon PostgreSQL へ移行](/blog/medicine-recommend-cloud-migration)した後も、セッションとグローバル状態をDBに置く設計はそのまま活きており、Cloud Run のインスタンスのスケールや複数コンテナ稼働時も一貫した動作を保つ基盤になっています。

## 開発を通じて学んだこと

### 1. 分散システムの難しさ

複数インスタンス間でセッションデータを共有する際、**競合状態の処理**に苦労しました。同じセッションに対して複数のインスタンスが同時に書き込みを行う場合、データの整合性を保つ必要があります。

**解決策**: 
- PostgreSQLのトランザクション機能を活用
- 楽観的ロック（Optimistic Locking）の実装
- タイムスタンプによる更新時刻の管理

### 2. パフォーマンスの最適化

DBへのアクセスが頻繁になると、パフォーマンスが低下する可能性があります。

**解決策**: 
- インデックスの適切な使用
- セッションのキャッシュ機能
- バッチ処理による効率化

### 3. エラーハンドリングの重要性

DB接続失敗時は、メモリベースの動作にフォールバックする必要があります。

**解決策**: 
- 自動フォールバック機能の実装
- エラーログの適切な記録
- ユーザーへの影響を最小限に抑える

## トラブルシューティング

### 問題: セッションデータが失われる

**原因**: DB接続失敗時にメモリベースにフォールバックし、インスタンスが再起動されるとデータが失われる

**解決策**: 
- DB接続の再試行ロジックの実装
- セッションデータの定期的なバックアップ
- ヘルスチェック機能の実装

### 問題: パフォーマンスの低下

**原因**: DBへのアクセスが頻繁になり、レスポンス時間が長くなる

**解決策**: 
- セッションのキャッシュ機能の実装
- インデックスの最適化
- バッチ処理による効率化

### 問題: 競合状態の発生

**原因**: 複数のインスタンスが同じセッションに対して同時に書き込みを行う

**解決策**: 
- PostgreSQLのトランザクション機能を活用
- 楽観的ロックの実装
- タイムスタンプによる更新時刻の管理

## 本番環境での位置づけ（READMEとの対応）

リポジトリのREADMEでは、マルチインスタンス対応は次のように整理されています。

- **PostgreSQLベースのセッション管理**: 複数インスタンス間でセッションデータを共有
- **グローバル状態の同期**: AI_AUTO_REPLY、ADMIN_MODE、MANUAL_REPLY_QUEUE をDBで管理
- **Render Manual Scaling対応**: 2〜3台のインスタンスで同時接続15台に対応
- **自動フォールバック**: DB接続失敗時はメモリベースの動作にフォールバック

なお、2026年2月には **GCP Cloud Run** および **Neon PostgreSQL** へ移行しています。Cloud Run ではインスタンスのスケールやマルチインスタンスの扱いがRenderと異なりますが、セッションとグローバル状態をDBに置く設計はそのまま活きており、どの実行環境でも一貫した動作を保つ基盤になっています。

## まとめ

マルチインスタンス対応の実装により、複数インスタンス間でセッションデータを共有できるようになりました。PostgreSQLベースのセッション管理システムにより、スケーラビリティが向上し、2〜3台のインスタンスで同時接続15台に対応できるようになりました。

**分散システムの難しさを実感しながらも、継続的な改善により、より堅牢なシステムを構築できました。**

今後も、Cloud Run / Neon 環境に合わせたチューニングや、より効率的なセッション管理の検討を続けていきます。
