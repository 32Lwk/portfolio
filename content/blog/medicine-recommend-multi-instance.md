---
title: "マルチインスタンス対応の実装 - PostgreSQLベースのセッション管理システム"
description: "Render Manual Scaling対応のため、PostgreSQLベースのセッション管理システムを実装し、複数インスタンス間でセッションデータを共有する機能について"
date: "2025-11-05"
category: "プロジェクト"
tags: ["医薬品相談ツール", "PostgreSQL", "パフォーマンス"]
author: "川嶋宥翔"
featured: false
---

# マルチインスタンス対応の実装 - PostgreSQLベースのセッション管理システム

Render Manual Scaling対応のため、PostgreSQLベースのセッション管理システムを実装しました。この記事では、複数インスタンス間でセッションデータを共有する機能の実装と、開発を通じて学んだことについて解説します。

## 開発の背景

### Render Manual Scalingの課題

Render Manual Scalingを使用する場合、複数のインスタンスが起動します。しかし、Flaskのデフォルトのセッション管理（メモリベース）では、**インスタンス間でセッションデータが共有されない**という問題がありました。

### 解決のアプローチ

PostgreSQLベースのセッション管理システムを実装し、複数インスタンス間でセッションデータを共有できるようにしました。

## 実装の詳細

### 1. セッションテーブルの作成

```python
# src/services/database.py
def create_session_table():
    """
    セッションテーブルを作成
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255),
            messages JSONB,
            last_activity TIMESTAMP,
            client_ip VARCHAR(45),
            user_agent TEXT,
            user_attributes JSONB,
            session_active BOOLEAN DEFAULT TRUE,
            crisis_detected BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # インデックスの作成
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_sessions_last_activity 
        ON sessions(last_activity)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_sessions_active 
        ON sessions(session_active) 
        WHERE session_active = TRUE
    """)
    
    conn.commit()
    cursor.close()
    return_connection(conn)
```

### 2. セッションの保存と取得

```python
# src/services/session_manager.py
def save_session_to_db(session_id, session_data):
    """
    セッションをデータベースに保存
    
    Args:
        session_id: セッションID
        session_data: セッションデータ
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO sessions (
                session_id, username, messages, last_activity,
                client_ip, user_agent, user_attributes, session_active,
                crisis_detected, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP
            )
            ON CONFLICT (session_id) 
            DO UPDATE SET
                username = EXCLUDED.username,
                messages = EXCLUDED.messages,
                last_activity = EXCLUDED.last_activity,
                client_ip = EXCLUDED.client_ip,
                user_agent = EXCLUDED.user_agent,
                user_attributes = EXCLUDED.user_attributes,
                session_active = EXCLUDED.session_active,
                crisis_detected = EXCLUDED.crisis_detected,
                updated_at = CURRENT_TIMESTAMP
        """, (
            session_id,
            session_data.get('username'),
            json.dumps(session_data.get('messages', [])),
            session_data.get('last_activity'),
            session_data.get('client_ip'),
            session_data.get('user_agent'),
            json.dumps(session_data.get('user_attributes', {})),
            session_data.get('session_active', True),
            session_data.get('crisis_detected', False)
        ))
        
        conn.commit()
    except Exception as e:
        logger.error(f"セッション保存エラー: {e}")
        conn.rollback()
    finally:
        cursor.close()
        return_connection(conn)

def get_session_from_db(session_id):
    """
    データベースからセッションを取得
    
    Args:
        session_id: セッションID
    
    Returns:
        session_data: セッションデータ（存在しない場合はNone）
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                session_id, username, messages, last_activity,
                client_ip, user_agent, user_attributes, session_active,
                crisis_detected
            FROM sessions
            WHERE session_id = %s AND session_active = TRUE
        """, (session_id,))
        
        row = cursor.fetchone()
        if row:
            return {
                'session_id': row[0],
                'username': row[1],
                'messages': json.loads(row[2]) if row[2] else [],
                'last_activity': row[3],
                'client_ip': row[4],
                'user_agent': row[5],
                'user_attributes': json.loads(row[6]) if row[6] else {},
                'session_active': row[7],
                'crisis_detected': row[8]
            }
        return None
    except Exception as e:
        logger.error(f"セッション取得エラー: {e}")
        return None
    finally:
        cursor.close()
        return_connection(conn)
```

### 3. グローバル状態の同期

AI_AUTO_REPLY、ADMIN_MODE、MANUAL_REPLY_QUEUEをDBで管理：

```python
# src/services/session_manager.py
def get_manual_reply_queue():
    """
    手動返信キューを取得（DBから）
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT queue_data FROM global_state 
            WHERE key = 'manual_reply_queue'
        """)
        
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
        return []
    except Exception as e:
        logger.error(f"キュー取得エラー: {e}")
        return []
    finally:
        cursor.close()
        return_connection(conn)

def set_manual_reply_queue(queue):
    """
    手動返信キューを設定（DBに保存）
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO global_state (key, queue_data, updated_at)
            VALUES ('manual_reply_queue', %s, CURRENT_TIMESTAMP)
            ON CONFLICT (key) 
            DO UPDATE SET
                queue_data = EXCLUDED.queue_data,
                updated_at = CURRENT_TIMESTAMP
        """, (json.dumps(queue),))
        
        conn.commit()
    except Exception as e:
        logger.error(f"キュー設定エラー: {e}")
        conn.rollback()
    finally:
        cursor.close()
        return_connection(conn)
```

### 4. 自動フォールバック

DB接続失敗時はメモリベースの動作にフォールバック：

```python
def get_session_with_fallback(session_id):
    """
    セッションを取得（DB失敗時はメモリベースにフォールバック）
    """
    try:
        # DBから取得を試みる
        session_data = get_session_from_db(session_id)
        if session_data:
            return session_data
    except Exception as e:
        logger.warning(f"DB接続失敗、メモリベースにフォールバック: {e}")
    
    # メモリベースのセッションを返す
    return flask_session.get(session_id)
```

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

## まとめ

マルチインスタンス対応の実装により、複数インスタンス間でセッションデータを共有できるようになりました。PostgreSQLベースのセッション管理システムにより、スケーラビリティが向上し、2-3台のインスタンスで同時接続15台に対応できるようになりました。

**分散システムの難しさを実感しながらも、継続的な改善により、より堅牢なシステムを構築できました。**

今後も、より効率的なセッション管理システムの構築を目指していきます。
