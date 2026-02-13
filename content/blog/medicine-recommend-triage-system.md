---
title: "LLMトリアージ機能の詳細 - 5つのカテゴリへの自動分類と2段階トリアージシステム"
description: "ユーザー入力を5つのカテゴリに自動分類し、2段階トリアージシステムで詳細なサブカテゴリ分類を実行する機能の実装について"
date: "2025-12-16"
category: "プロジェクト"
tags: ["医薬品相談ツール", "LLM"]
author: "川嶋宥翔"
featured: true
---

# LLMトリアージ機能の詳細 - 5つのカテゴリへの自動分類と2段階トリアージシステム

ユーザー入力を5つのカテゴリに自動分類し、適切なフローに振り分けるLLMトリアージ機能を実装しました。この記事では、2段階トリアージシステムとconfidenceスコアによる判定の実装について解説します。

## システムアーキテクチャ

### 1. 5つのカテゴリ分類

ユーザー入力を以下の5つのカテゴリに自動分類：

- **Physical（身体的症状）**: 頭痛、発熱、のどの痛み、眠気など → 医薬品推奨フロー
- **Emotional（精神的・感情的症状）**: 緊張、不安、恋愛の悩み、不眠など → カウンセリングフロー
- **Emergency（緊急性が高い症状）**: 心臓が痛い、呼吸困難など → 救急受診推奨
- **Ask（医薬品質問）**: 特定の医薬品についての質問 → 医薬品質問応答
- **Other（その他）**: 挨拶、不明な入力、店舗案内、遺失物関連など → 汎用応答または店舗案内フロー

### 2. 2段階トリアージシステム

**第1段階**: 広範なカテゴリ分類（Physical/Emotional/Emergency/Ask/Other）

**第2段階**: Otherカテゴリの場合のみ、詳細なサブカテゴリ分類を実行（全20種類）

## 実装の詳細

### 1. LLMトリアージの実装

```python
# src/core/triage.py
def triage_user_input(user_text, conversation_history=None):
    """
    ユーザー入力をトリアージ（5つのカテゴリに分類）
    
    Args:
        user_text: ユーザーの入力テキスト
        conversation_history: 会話履歴（オプション）
    
    Returns:
        triage_result: トリアージ結果（カテゴリ、confidenceスコアなど）
    """
    # キャッシュから取得
    cache_key = hash(user_text + str(conversation_history))
    if cache_key in _triage_cache:
        return _triage_cache[cache_key]
    
    # LLM APIを呼び出し
    prompt = f"""
    ユーザーの入力を以下の5つのカテゴリに分類してください：
    
    1. Physical（身体的症状）: 頭痛、発熱、のどの痛み、眠気など
    2. Emotional（精神的・感情的症状）: 緊張、不安、恋愛の悩み、不眠など
    3. Emergency（緊急性が高い症状）: 心臓が痛い、呼吸困難など
    4. Ask（医薬品質問）: 特定の医薬品についての質問
    5. Other（その他）: 挨拶、不明な入力、店舗案内、遺失物関連など
    
    ユーザー入力: {user_text}
    
    会話履歴:
    {format_conversation_history(conversation_history) if conversation_history else "なし"}
    
    以下のJSON形式で返答してください：
    {{
        "category": "Physical|Emotional|Emergency|Ask|Other",
        "confidence": 0.0-1.0,
        "reasoning": "分類の理由"
    }}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは医薬品相談AIアシスタントです。ユーザーの入力を適切なカテゴリに分類してください。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=200
    )
    
    result = parse_triage_response(response.choices[0].message.content)
    
    # キャッシュに保存
    _triage_cache[cache_key] = result
    
    return result
```

### 2. 2段階トリアージシステム

```python
def process_detailed_classification(user_text, triage_result):
    """
    2段階トリアージ: Otherカテゴリの場合、詳細なサブカテゴリ分類を実行
    
    Args:
        user_text: ユーザーの入力テキスト
        triage_result: 第1段階のトリアージ結果
    
    Returns:
        detailed_result: 詳細な分類結果
    """
    if triage_result['category'] != 'Other':
        return triage_result
    
    # 第2段階: 詳細なサブカテゴリ分類
    subcategories = [
        # 不適切な要求（9種類）
        "inappropriate_request/prescription",  # 処方薬の要求
        "inappropriate_request/weight_loss",   # 痩せ薬・ダイエット薬の要求
        "inappropriate_request/love_potion",   # 惚れ薬・媚薬の要求
        "inappropriate_request/cure_prevention", # 完治・予防を目的とした薬の要求
        "inappropriate_request/anti_aging",     # アンチエイジング・若返りの薬の要求
        "inappropriate_request/body_shape",    # 身体の特定部位の形状変化の薬の要求
        "inappropriate_request/hair_growth",    # 毛が生える・ハゲが治る薬の要求
        "inappropriate_request/illegal",       # 違法薬物の要求
        "inappropriate_request/controlled",   # 規制薬物の要求
        
        # 店舗案内関連（9種類）
        "store_inquiry",                       # 店舗案内（基本）
        "store_inquiry/inventory",            # 在庫確認
        "store_inquiry/facilities",           # 周辺施設
        "store_inquiry/tax_free",             # 免税対応
        "store_inquiry/tourism",              # 周辺観光地
        "store_inquiry/business_hours",       # 営業時間・アクセス
        "store_inquiry/payment",              # 支払い方法
        "store_inquiry/parking",               # 駐車場
        "store_inquiry/services",             # 店舗サービス
        "lost_and_found",                      # 遺失物関連
        "general_other"                        # その他の一般的な質問
    ]
    
    # LLMによる詳細分類
    detailed_prompt = f"""
    ユーザーの入力を以下のサブカテゴリに分類してください：
    
    {', '.join(subcategories)}
    
    ユーザー入力: {user_text}
    
    以下のJSON形式で返答してください：
    {{
        "subcategory": "サブカテゴリ名",
        "confidence": 0.0-1.0,
        "reasoning": "分類の理由"
    }}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは医薬品相談AIアシスタントです。ユーザーの入力を詳細なサブカテゴリに分類してください。"},
            {"role": "user", "content": detailed_prompt}
        ],
        temperature=0.3,
        max_tokens=200
    )
    
    detailed_result = parse_detailed_response(response.choices[0].message.content)
    detailed_result['category'] = 'Other'  # 元のカテゴリを保持
    
    return detailed_result
```

### 3. ハイブリッド検出方式

キーワードマッチングとLLM分類を組み合わせた堅牢な検出：

```python
def hybrid_triage_detection(user_text):
    """
    ハイブリッド検出: キーワードマッチング + LLM分類
    """
    # 1. キーワードマッチング（高速）
    keyword_result = keyword_based_triage(user_text)
    
    if keyword_result['confidence'] >= 0.9:
        return keyword_result
    
    # 2. LLM分類（高精度）
    llm_result = triage_user_input(user_text)
    
    # 3. 信頼度閾値処理
    if llm_result['confidence'] >= 0.7:
        return llm_result
    else:
        # LLM信頼度が低い場合はキーワードマッチングにフォールバック
        return keyword_result
```

## confidenceスコアによる判定

### 1. confidenceスコアの使用

```python
def route_by_confidence(triage_result):
    """
    confidenceスコアに基づいてルーティング
    
    Args:
        triage_result: トリアージ結果
    
    Returns:
        route_action: ルーティングアクション
    """
    category = triage_result['category']
    confidence = triage_result['confidence']
    
    # Emergencyカテゴリ: 0.5以上で安全側に倒して緊急対応フローへ
    if category == 'Emergency':
        if confidence >= 0.5:
            return 'emergency_flow'
        else:
            return 'clarification_needed'
    
    # その他のカテゴリ: 0.7未満はユーザーに確認を求める
    if confidence < 0.7:
        return 'clarification_needed'
    
    # カテゴリに応じたルーティング
    routing_map = {
        'Physical': 'recommendation_flow',
        'Emotional': 'counseling_flow',
        'Ask': 'medicine_inquiry_flow',
        'Other': 'general_response_flow'
    }
    
    return routing_map.get(category, 'general_response_flow')
```

### 2. 心臓緊急チェック（ステップ0）

「心臓」「動悸」「不整脈」を含む入力の最優先チェック：

```python
def check_heart_emergency(user_text):
    """
    心臓緊急チェック（ステップ0）
    """
    heart_keywords = ["心臓", "動悸", "不整脈", "心拍"]
    
    for keyword in heart_keywords:
        if keyword in user_text:
            # 比喩的表現の検出
            if is_metaphorical_expression(user_text, keyword):
                continue  # 比喩的表現の場合はスキップ
            
            # 会話履歴の活用
            if conversation_history:
                context = analyze_conversation_context(conversation_history)
                if context['type'] == 'romantic':
                    # 恋愛文脈の場合は閾値を上げる
                    if confidence < 0.7:
                        continue
            
            # 緊急対応メッセージを表示
            return {
                'category': 'Emergency',
                'confidence': 1.0,
                'emergency_type': 'heart',
                'message': '心臓に関する症状が疑われます。すぐに医療機関を受診してください。'
            }
    
    return None
```

## 早期リターン最適化

店舗関連の質問は早期に処理し、医薬品推奨フローへの影響を最小化：

```python
def early_return_optimization(user_text):
    """
    早期リターン最適化: 店舗関連の質問を早期に処理
    """
    store_keywords = [
        "在庫", "場所", "どこ", "トイレ", "駐車場",
        "営業時間", "アクセス", "支払い", "免税"
    ]
    
    for keyword in store_keywords:
        if keyword in user_text:
            # 店舗案内フローに即座にルーティング
            return {
                'category': 'Other',
                'subcategory': 'store_inquiry',
                'confidence': 0.9,
                'early_return': True
            }
    
    return None
```

## トラブルシューティング

### 問題: カテゴリの誤分類

**原因**: LLMの信頼度が低い、または文脈の理解不足

**解決策**: 
- キーワードマッチングとのハイブリッド検出
- 会話履歴の活用
- confidenceスコアによる閾値処理

### 問題: パフォーマンスの低下

**原因**: LLM API呼び出しの頻度が高い

**解決策**: 
- キャッシュ機能の実装
- 早期リターン最適化
- キーワードマッチングの優先使用

### 問題: 緊急事案の見逃し

**原因**: confidenceスコアの閾値が高すぎる

**解決策**: 
- Emergencyカテゴリの閾値を0.5に下げる
- 心臓緊急チェックの優先実行
- 安全側に倒す判定ロジック

## まとめ

LLMトリアージ機能の実装により、ユーザー入力を5つのカテゴリに自動分類し、適切なフローに振り分けることができるようになりました。2段階トリアージシステムとconfidenceスコアによる判定により、より正確な分類を実現しました。

今後も、より多くのパターンに対応し、分類精度の向上を続けていきます。
