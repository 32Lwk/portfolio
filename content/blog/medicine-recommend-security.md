---
title: セキュリティ機能の実装 - プロンプトインジェクション対策と入力検証
description: 医療情報システムとして必須のセキュリティ機能、特にプロンプトインジェクション対策と入力検証の実装について
date: '2025-12-09'
category: プロジェクト
tags:
  - 医薬品相談ツール
  - セキュリティ
author: 川嶋宥翔
featured: false
hidden: false
---

# セキュリティ機能の実装 - プロンプトインジェクション対策と入力検証

医療情報システムとして、セキュリティは最優先事項です。この記事では、プロンプトインジェクション対策と入力検証の実装について詳しく解説します。

## セキュリティの多層防御（README・リポジトリとの対応）

[medicine-recommend-system](https://github.com/32Lwk/medicine-recommend-system) では、入力検証とブロック時の永続化は **`src/handlers/chat/chat_input_validator.py`** に集約されています。絶対ブロックは **`src/security/absolute_blocklist.py`**、リスクスコア・プロンプトインジェクション検出は **`src/security/security_validator.py`**、危機キーワードは **`src/core/crisis_detection.py`** で実装されています。ブロック時はセッションに案内メッセージを追加したうえで **`_persist_block_messages_to_db`** によりDB（またはメモリ）に保存し、`status: 'ok'` と `message_count` で返すため、フロントで必ず案内が表示されます。

システムは以下の3層でセキュリティを確保しています：

1. **絶対ブロックリスト**: 明確に不適切な内容を即座にブロック
2. **セキュリティ検証**: リスクスコアに基づく動的なブロック判定
3. **危機キーワード検出**: 自傷他害のリスクを検出

## 入力検証の実装

### 1. 絶対ブロックリスト

明確に不適切な内容を即座にブロックします：

```python
# src/security/absolute_blocklist.py
def is_absolutely_blocked(user_message):
    """
    絶対ブロックリストによる判定
    """
    inappropriate_keywords = [
        "スカトロ", "パパ活", "おっぱぶ", "ナンパ", "出会い系",
        "ロリコン", "ショタコン", "ビッチ", "ヤリマン",
        # ... その他の不適切なキーワード
    ]
    
    normalized_message = normalize_text(user_message)
    for keyword in inappropriate_keywords:
        if keyword in normalized_message:
            return True, keyword
    
    return False, None
```

### 2. セキュリティ検証

リスクスコアに基づく動的なブロック判定を実装：

```python
# src/handlers/chat/chat_input_validator.py
def validate_and_block_input(session, request, user_message, sid):
    """
    入力の検証・ブロック・危機検出を行う
    """
    # 1. 絶対ブロックリストチェック
    blocked, _ = is_absolutely_blocked(user_message)
    if blocked:
        block_message = (
            'ご入力いただいた内容にはお答えできかねます。'
            'お体の不調やお薬のご相談がありましたら、お気軽にメッセージをお送りください。'
        )
        # セッションにメッセージを追加してDBに保存
        _persist_block_messages_to_db(session, request, sid)
        return (None, jsonify({'status': 'ok', 'response': block_message}))
    
    # 2. セキュリティ検証
    is_safe, risk_score, warnings, sanitized_message = validate_user_input(
        user_message, context='chat'
    )
    
    # 3. リスクスコアに基づくブロック判定
    if should_block_input(risk_score):
        block_message = '入力内容に問題が検出されました。症状や質問を自然な文章で入力してください。'
        _persist_block_messages_to_db(session, request, sid)
        return (None, jsonify({'status': 'ok', 'response': block_message}))
    
    # 4. 高リスク警告
    if risk_score >= 80:
        warn_message = '入力内容に不審なパターンが検出されました。症状や質問を自然な文章で入力してください。'
        _persist_block_messages_to_db(session, request, sid)
        return (None, jsonify({'status': 'ok', 'response': warn_message}))
    
    return (sanitized_message, None)
```

### 3. プロンプトインジェクション対策

LLMへの入力前に、プロンプトインジェクション攻撃を検出・ブロック：

```python
# src/security/security_validator.py
def validate_user_input(user_input, context='chat'):
    """
    ユーザー入力を検証し、リスクスコアを計算
    """
    risk_score = 0.0
    warnings = []
    
    # プロンプトインジェクション攻撃パターン
    injection_patterns = [
        r'ignore\s+previous\s+instructions',
        r'forget\s+everything',
        r'you\s+are\s+now',
        r'system\s*:',
        r'user\s*:',
        r'<\|.*?\|>',  # 特殊トークン
        r'\[INST\]',  # Llama形式
        # ... その他のパターン
    ]
    
    for pattern in injection_patterns:
        if re.search(pattern, user_input, re.IGNORECASE):
            risk_score += 30
            warnings.append(f"プロンプトインジェクション攻撃パターンを検出: {pattern}")
    
    # 長すぎる入力
    if len(user_input) > 1000:
        risk_score += 20
        warnings.append("入力が長すぎます")
    
    # 特殊文字の過剰使用
    special_char_count = sum(1 for c in user_input if c in '<>[]{}|\\')
    if special_char_count > 10:
        risk_score += 15
        warnings.append("特殊文字が過剰に使用されています")
    
    # サニタイズ
    sanitized = sanitize_input(user_input)
    
    is_safe = risk_score < 80
    
    return is_safe, risk_score, warnings, sanitized
```

### 4. 入力のサニタイズ

```python
def sanitize_input(user_input):
    """
    ユーザー入力をサニタイズ
    """
    # 特殊トークンの除去
    sanitized = re.sub(r'<\|.*?\|>', '', user_input)
    sanitized = re.sub(r'\[INST\].*?\[/INST\]', '', sanitized, flags=re.DOTALL)
    
    # 制御文字の除去
    sanitized = ''.join(char for char in sanitized if ord(char) >= 32 or char in '\n\r\t')
    
    # 長さ制限
    if len(sanitized) > 1000:
        sanitized = sanitized[:1000]
    
    return sanitized
```

## 危機キーワード検出

自傷他害のリスクを検出し、適切な支援リソースを提供：

```python
# src/core/crisis_detection.py
def detect_crisis_keywords(user_message):
    """
    危機関連キーワードを検出
    """
    crisis_keywords = [
        "死にたい", "消えたい", "自殺", "自傷", "リストカット",
        "首を", "首つり", "飛び降り", "飛び込み",
        # ... その他の危機キーワード
    ]
    
    detected = []
    normalized_message = normalize_text(user_message)
    
    for keyword in crisis_keywords:
        if keyword in normalized_message:
            detected.append(keyword)
    
    return len(detected) > 0, detected
```

### 危機対応の実装

```python
# src/handlers/chat/chat_input_validator.py
has_crisis_keywords, detected_keywords = detect_crisis_keywords(sanitized_message)
if has_crisis_keywords:
    # 危機対応メッセージを生成
    crisis_resources = get_crisis_support_resources(user_language)
    
    bot_response = {
        'type': 'bot',
        'content': crisis_resources['message'],
        'crisis_support': True,
        'crisis_title': crisis_resources['title'],
        'resources': crisis_resources['resources'],
        'emergency_message': crisis_resources['emergency_message'],
    }
    
    # セッションに追加してDBに保存
    session['messages'].append(bot_response)
    save_session_to_db(sid, session_data)
    
    # 管理画面の手動返信キューに追加（最高優先度）
    crisis_queue_item = {
        'session_id': sid,
        'user_message': sanitized_message,
        'status': 'crisis_detected',
        'crisis_keywords': detected_keywords,
        'priority': 'high'
    }
    add_to_manual_reply_queue(crisis_queue_item)
```

## ブロック時のUI表示改善

ブロック時もセッションにメッセージを追加し、UIに案内を表示：

```python
def _persist_block_messages_to_db(session, request, sid):
    """
    ブロック時にFlask sessionへ追加したメッセージをDBに保存
    """
    if not sid:
        return
    
    session_data = get_session_from_db(sid)
    if not session_data:
        session_data = {
            'session_id': sid,
            'username': session.get('username', 'Unknown'),
            'messages': list(session.get('messages', [])),
            'last_activity': datetime.now(),
            # ...
        }
    else:
        session_data['messages'] = list(session.get('messages', []))
        session_data['last_activity'] = datetime.now()
    
    save_session_to_db(sid, session_data)
```

## ログ記録

すべてのセキュリティイベントをログに記録：

```python
# src/security/security_logger.py
def log_input_validation(user_id, input_text, risk_score, is_safe, warnings, sanitized_text):
    """
    入力検証のログを記録
    """
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'user_id': user_id,
        'input_text': input_text[:200],  # プライバシー保護のため切り詰め
        'risk_score': risk_score,
        'is_safe': is_safe,
        'warnings': warnings,
        'sanitized_text': sanitized_text[:200]
    }
    
    with open('log/security_events.jsonl', 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
```

## トラブルシューティング

### 問題: 正常な医療相談がブロックされる

**原因**: リスクスコアの閾値が厳しすぎる

**解決策**: 
- 医療用語を含む場合はリスクスコアを減算
- 文脈を考慮した判定ロジックの実装

### 問題: プロンプトインジェクション攻撃が検出されない

**原因**: 新しい攻撃パターンへの対応不足

**解決策**: 
- 攻撃パターンリストの継続的な更新
- 異常な入力パターンの機械学習による検出

### 問題: ブロック時にUIに何も表示されない

**原因**: エラーレスポンスのみで、セッションにメッセージが追加されていない

**解決策**: 
- `_persist_block_messages_to_db()`関数でDBに保存
- `status: 'ok'`と`message_count`で返すように変更

## まとめ

セキュリティ機能の実装により、プロンプトインジェクション攻撃や不適切な入力を効果的にブロックできるようになりました。医療情報システムとして、継続的なセキュリティ対策の実施が重要です。

今後も、新しい攻撃パターンへの対応と、セキュリティログの分析を続けていきます。
