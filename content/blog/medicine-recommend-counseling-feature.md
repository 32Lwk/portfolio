---
title: "カウンセリング機能の詳細 - 感情的症状への共感的な対応と会話履歴を活用した文脈理解"
description: "緊張、不安、恋愛の悩みなどに対するカウンセリング的返信を生成し、会話履歴を活用した文脈理解を実現する機能の実装について"
date: "2025-12-16"
category: "プロジェクト"
tags: ["医薬品相談ツール", "LLM"]
author: "川嶋宥翔"
featured: false
---

# カウンセリング機能の詳細 - 感情的症状への共感的な対応と会話履歴を活用した文脈理解

緊張、不安、恋愛の悩みなどに対するカウンセリング的返信を生成する機能を実装しました。この記事では、会話履歴を活用した文脈理解と、不眠・眠気カウンセリング機能の実装について解説します。

## 開発の背景

身体的症状だけでなく、精神的・感情的症状にも対応する必要がありました。例えば：

- **緊張・不安**: 試験前の緊張、仕事のストレス
- **恋愛の悩み**: 失恋、片思い
- **不眠**: 眠れない、睡眠不足
- **眠気**: 日中の眠気、居眠り

これらの感情的症状に対して、共感的で適切なカウンセリング的返信を提供する必要がありました。

## カウンセリング機能の実装

### 1. カウンセリング返信の生成

```python
# src/services/counseling/counseling_generator.py
def generate_counseling_response(
    symptom_type: str,
    user_text: str,
    client: OpenAI,
    conversation_history: List[Dict] = None,
    session_id: str = None
) -> str:
    """
    カウンセリング的返信を生成
    
    Args:
        symptom_type: 感情的症状タイプ
        user_text: ユーザーの入力テキスト
        client: OpenAIクライアントインスタンス
        conversation_history: 会話履歴（直近10件まで使用）
        session_id: セッションID（ログ記録用）
    
    Returns:
        カウンセリング的返信テキスト
    """
    # プロンプトテンプレートを取得
    template = get_counseling_prompt_template(symptom_type)
    
    # 会話履歴の準備（直近10件）
    history_context = ""
    if conversation_history:
        recent_history = conversation_history[-10:]  # 直近10件
        history_text = format_conversation_history(recent_history)
        if history_text.strip():
            history_context = f"""
            
【会話履歴（文脈理解のため）】
{history_text}
"""
    
    prompt = template["user_prompt_template"].format(
        history_context=history_context,
        user_text=user_text,
        symptom_type=symptom_type
    )
    
    max_length = template.get("max_length", 200)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"{template['system_message']} 返信は{max_length}文字以内に収めてください。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=max_length * 2
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # 文字数制限を超える場合は切り詰める
        if len(response_text) > max_length:
            response_text = response_text[:max_length] + "..."
        
        return response_text
    except Exception as e:
        logger.error(f"カウンセリング返信生成エラー: {e}")
        return "お気持ちをお聞かせいただき、ありがとうございます。応援しています。"
```

### 2. 会話履歴のフォーマット

```python
def format_conversation_history(conversation_history):
    """
    会話履歴をフォーマット
    
    Args:
        conversation_history: 会話履歴のリスト
    
    Returns:
        formatted_history: フォーマットされた会話履歴テキスト
    """
    history_lines = []
    
    for msg in conversation_history:
        role = msg.get('type', 'unknown')
        content = msg.get('content', '')
        
        if role == 'user':
            history_lines.append(f"ユーザー: {content}")
        elif role == 'bot':
            history_lines.append(f"アシスタント: {content}")
    
    return "\n".join(history_lines)
```

### 3. 文脈理解の改善

「勉強中」のような短い入力も、会話履歴から質問への回答として適切に解釈：

```python
def interpret_short_input(user_text, conversation_history):
    """
    短い入力を会話履歴から解釈
    
    Args:
        user_text: ユーザーの入力テキスト
        conversation_history: 会話履歴
    
    Returns:
        interpreted_context: 解釈された文脈
    """
    if len(user_text) <= 5 and conversation_history:
        # 直前のメッセージを確認
        last_bot_message = None
        for msg in reversed(conversation_history):
            if msg.get('type') == 'bot':
                last_bot_message = msg.get('content', '')
                break
        
        # 質問への回答として解釈
        if last_bot_message and '?' in last_bot_message:
            # 会話履歴を考慮した解釈
            interpreted_context = f"{last_bot_message} → {user_text}"
            return interpreted_context
    
    return user_text
```

## 不眠カウンセリング機能

### 1. 期間・妊娠/授乳チェック機能

```python
def check_insomnia_conditions(user_text, user_info):
    """
    不眠カウンセリングの条件チェック
    
    Args:
        user_text: ユーザーの入力テキスト
        user_info: ユーザー情報
    
    Returns:
        should_refer_to_doctor: 医師受診を推奨するか
        reason: 理由
    """
    # 期間チェック（2週間以上）
    duration_keywords = ["2週間", "14日", "2週", "半月"]
    has_long_duration = any(keyword in user_text for keyword in duration_keywords)
    
    if has_long_duration:
        return True, "慢性的な不眠の可能性があるため、医療機関（内科、精神科、心療内科など）への受診を推奨します。"
    
    # 妊娠/授乳チェック
    if user_info.get('pregnant') or user_info.get('breastfeeding'):
        return True, "市販の睡眠改善薬の使用を避けるべきため、医師への相談を推奨します。"
    
    return False, None
```

### 2. 医薬品推奨への移行

カウンセリング中に「薬を教えて」などの要求があった場合、医薬品推奨フローに移行：

```python
def check_medicine_request(user_text):
    """
    医薬品推奨への移行をチェック
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        should_switch: 医薬品推奨フローに移行するか
    """
    medicine_request_keywords = [
        "薬を教えて", "薬を知りたい", "薬を教えてください",
        "カフェイン剤を教えて", "睡眠改善薬を教えて"
    ]
    
    for keyword in medicine_request_keywords:
        if keyword in user_text:
            return True
    
    return False
```

## 眠気カウンセリング機能

### 1. 不眠との明確な区別

```python
def distinguish_drowsiness_from_insomnia(user_text):
    """
    眠気と不眠を区別
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        symptom_type: "drowsiness" または "insomnia"
    """
    drowsiness_keywords = [
        "眠気", "寝てしまう", "眠たい", "寝むたい",
        "居眠り", "眠くてたまらない"
    ]
    
    insomnia_keywords = [
        "不眠", "眠れない", "睡眠不足", "寝つきが悪い"
    ]
    
    user_text_lower = user_text.lower()
    
    # 眠気キーワードの検出
    has_drowsiness = any(keyword in user_text_lower for keyword in drowsiness_keywords)
    
    # 不眠キーワードの検出
    has_insomnia = any(keyword in user_text_lower for keyword in insomnia_keywords)
    
    if has_drowsiness and not has_insomnia:
        return "drowsiness"
    elif has_insomnia:
        return "insomnia"
    
    return None
```

### 2. カフェイン剤推奨への移行

```python
def check_caffeine_request(user_text):
    """
    カフェイン剤推奨への移行をチェック
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        should_switch: カフェイン剤推奨フローに移行するか
    """
    caffeine_request_keywords = [
        "薬を教えて", "カフェイン剤を教えて", "しりたい",
        "眠気覚まし", "覚醒剤"
    ]
    
    for keyword in caffeine_request_keywords:
        if keyword in user_text:
            return True
    
    return False
```

## 話題転換の自動検知

カウンセリング中に新しい症状が検出された場合、自動的に話題を転換：

```python
def detect_topic_shift(user_text, conversation_history):
    """
    話題転換を検知
    
    Args:
        user_text: ユーザーの入力テキスト
        conversation_history: 会話履歴
    
    Returns:
        should_shift: 話題を転換するか
        new_topic: 新しいトピック
    """
    # 身体的症状の検出
    physical_symptoms = detect_physical_symptoms(user_text)
    
    if physical_symptoms:
        # 関連性スコアを計算
        relevance_score = calculate_relevance_score(
            physical_symptoms, conversation_history
        )
        
        # 閾値0.5以上はカウンセリングの続きとして処理
        if relevance_score >= 0.5:
            return False, None
        else:
            return True, "physical_symptoms"
    
    return False, None
```

## 終了条件の判定

```python
def check_counseling_end_conditions(user_text, conversation_history):
    """
    カウンセリング終了条件をチェック
    
    Args:
        user_text: ユーザーの入力テキスト
        conversation_history: 会話履歴
    
    Returns:
        should_end: カウンセリングを終了するか
        end_reason: 終了理由
    """
    # 感謝の表現
    gratitude_keywords = ["ありがとう", "助かりました", "もう大丈夫"]
    if any(keyword in user_text for keyword in gratitude_keywords):
        return True, "user_gratitude"
    
    # 希死念慮・自傷他害の示唆
    crisis_keywords = ["死にたい", "消えたい", "自殺"]
    if any(keyword in user_text for keyword in crisis_keywords):
        return True, "crisis_detected"  # 専門機関案内へ
    
    # 情報収集が進まない場合
    if len(conversation_history) > 10:
        return True, "information_collection_stalled"  # 医療機関受診を推奨
    
    return False, None
```

## トラブルシューティング

### 問題: 文脈が理解されない

**原因**: 会話履歴が適切にフォーマットされていない

**解決策**: 
- 会話履歴のフォーマット関数の改善
- 直近10件の会話履歴の使用

### 問題: 返信が長すぎる

**原因**: 文字数制限が適切に設定されていない

**解決策**: 
- max_lengthパラメータの設定
- 文字数制限の強制適用

### 問題: 話題転換が適切でない

**原因**: 関連性スコアの閾値が不適切

**解決策**: 
- 関連性スコアの閾値を0.5に調整
- 会話履歴を考慮した判定

## まとめ

カウンセリング機能の実装により、感情的症状に対して共感的で適切な返信を生成できるようになりました。会話履歴を活用した文脈理解と、不眠・眠気カウンセリング機能により、より包括的なサポートを実現しました。

今後も、より多くの感情的症状に対応し、カウンセリング品質の向上を続けていきます。
