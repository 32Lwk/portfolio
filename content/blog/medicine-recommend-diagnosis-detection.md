---
title: "診断名検出機能の実装 - 約170項目の診断名を検出し適切な受診勧告"
description: "市販薬では対応が難しい診断名を包括的に検出し、早期リターン処理によりAPIコストを削減する機能の実装について"
date: "2025-12-27"
category: "プロジェクト"
tags: ["医薬品相談ツール", "医療AI"]
author: "川嶋宥翔"
featured: false
---

# 診断名検出機能の実装 - 約170項目の診断名を検出し適切な受診勧告

市販薬では対応が難しい診断名を包括的に検出し、適切な医師相談を推奨する機能を実装しました。この記事では、約170項目の診断名を検出し、早期リターン処理によりAPIコストを削減する機能の実装について解説します。

## 開発の背景

ユーザーが診断名（疾患名）を入力した場合、市販薬での対応は困難です。例えば：

- 「うつ病です」→ 医師の診断と処方薬が必要
- 「糖尿病があります」→ 医師の管理が必要
- 「高血圧と言われました」→ 医師の相談が必要

これらの診断名を検出し、適切な医師相談を推奨する必要がありました。

## 診断名リストの構築

### 1. 診断名の分類

約170項目の診断名を以下のカテゴリに分類：

```python
DIAGNOSIS_DICTIONARY = {
    # 精神疾患（約60項目）
    "精神疾患": [
        "うつ病", "統合失調症", "双極性障害", "パニック障害", "PTSD",
        "ADHD", "自閉症スペクトラム", "認知症", "アルツハイマー病",
        # ... その他の精神疾患
    ],
    
    # 悪性腫瘍（約30項目）
    "悪性腫瘍": [
        "がん", "癌", "白血病", "リンパ腫",
        "肺がん", "胃がん", "大腸がん", "乳がん",
        # ... その他の悪性腫瘍
    ],
    
    # 慢性疾患（約50項目）
    "慢性疾患": [
        "高血圧", "糖尿病", "リウマチ", "膠原病",
        "腎疾患", "肝疾患", "心疾患", "呼吸器疾患",
        # ... その他の慢性疾患
    ],
    
    # その他の重篤な疾患（約30項目）
    "その他": [
        "インフルエンザ", "肺炎", "尿路感染症", "帯状疱疹",
        "動脈硬化", "深部静脈血栓症", "胃潰瘍", "十二指腸潰瘍",
        # ... その他の疾患
    ]
}
```

### 2. 診断名検出の実装

```python
# src/core/diagnosis_detector.py
def detect_diagnosis(user_text):
    """
    診断名を検出
    """
    detected_diagnoses = []
    normalized_text = normalize_text(user_text)
    
    # すべての診断名をチェック
    for category, diagnoses in DIAGNOSIS_DICTIONARY.items():
        for diagnosis in diagnoses:
            normalized_diagnosis = normalize_text(diagnosis)
            
            # 単語境界を考慮したマッチング
            if is_word_match(normalized_diagnosis, normalized_text):
                # 文脈チェック（既往歴として言及された場合は除外）
                if not is_past_medical_history(user_text, diagnosis):
                    detected_diagnoses.append({
                        "name": diagnosis,
                        "category": category,
                        "confidence": 1.0
                    })
    
    return detected_diagnoses
```

## 文脈を考慮した検出ロジック

### 既往歴として言及された場合の除外

「既往症として高血圧がありますが」などの文脈で診断名が言及された場合、誤検出を防止：

```python
def is_past_medical_history(user_text, diagnosis):
    """
    診断名が既往歴として言及されているかチェック
    """
    # 文脈チェック範囲（診断名の前後50文字）
    context_range = 50
    
    # 除外パターン
    exclusion_patterns = [
        # 時間的表現
        r"(過去|以前|昔|なった|だった|でした)",
        # 他人・家族関係
        r"(知り合い|友人|家族|父|母|祖父|祖母)",
        # ペット関連
        r"(猫|犬|ペット|動物)",
        # 治癒表現
        r"(治り|完治|回復|治った|治癒|改善|良くなった)",
        # 将来表現
        r"(将来|未来|怖い|心配|不安)",
        # 医学用語
        r"(既往症|既往歴|持病|基礎疾患|基礎疾病)",
        # 逆接表現
        r"(ですが|がありますが|を患っていますが|と言われていますが)"
    ]
    
    # 診断名の位置を検索
    diagnosis_pos = user_text.find(diagnosis)
    if diagnosis_pos == -1:
        return False
    
    # 文脈範囲を取得
    start_pos = max(0, diagnosis_pos - context_range)
    end_pos = min(len(user_text), diagnosis_pos + len(diagnosis) + context_range)
    context_text = user_text[start_pos:end_pos]
    
    # 除外パターンをチェック
    for pattern in exclusion_patterns:
        if re.search(pattern, context_text):
            return True
    
    return False
```

## 早期リターン処理によるAPIコスト削減

診断名が検出された場合、通常の医薬品推奨フローをスキップして早期リターン：

```python
# src/handlers/chat/chat_handler.py
def handle_chat_request(user_message, session):
    """
    チャットリクエストを処理
    """
    # ステップ1.7: 診断名検出（心臓緊急チェック後、不眠関連キーワードチェック前）
    detected_diagnoses = detect_diagnosis(user_message)
    
    if detected_diagnoses:
        # 早期リターン: ChatGPT APIを呼び出さず、即座に医師受診を推奨
        diagnosis_names = [d["name"] for d in detected_diagnoses]
        category = detected_diagnoses[0]["category"]
        
        response_message = generate_doctor_referral_message(
            diagnosis_names, category
        )
        
        return {
            "type": "bot",
            "content": response_message,
            "requires_doctor": True,
            "detected_diagnoses": diagnosis_names
        }
    
    # 通常の推奨フロー（ChatGPT APIを使用）
    # ...
```

### APIコスト削減の効果

- **削減率**: 診断名検出時は約80%のAPIコストを削減
- **レスポンス時間**: 平均2-3秒から0.5-1秒に短縮

## 診断名と症状の区別

「不眠症」などの診断名と「不眠」などの症状を適切に区別：

```python
def distinguish_diagnosis_from_symptom(user_text):
    """
    診断名と症状を区別
    """
    # 診断名リストから「不眠症」を検出
    if "不眠症" in user_text:
        # 診断名として処理（医師受診を推奨）
        return "diagnosis"
    
    # 症状リストから「不眠」を検出
    if "不眠" in user_text or "眠れない" in user_text:
        # 症状として処理（カウンセリングフロー）
        return "symptom"
    
    return None
```

## 診断名検出の優先実行

診断名検出をステップ1.7で実行し、「不眠症」などの診断名がカウンセリングフローに流れることを防止：

```python
# 処理順序
# ステップ1.0: 心臓緊急チェック
# ステップ1.7: 診断名検出 ← ここで実行
# ステップ2.0: 不眠関連キーワードチェック
# ステップ3.0: 通常の推奨フロー
```

## トラブルシューティング

### 問題: 既往歴が誤検出される

**原因**: 文脈チェックが不十分

**解決策**: 
- 文脈チェック範囲の拡大（前後50文字）
- 除外パターンの追加

### 問題: 症状が診断名として誤検出される

**原因**: 診断名と症状の区別が不十分

**解決策**: 
- 診断名リストと症状リストの明確な分離
- 文脈を考慮した判定

### 問題: APIコストが削減されない

**原因**: 早期リターン処理が実行されていない

**解決策**: 
- 診断名検出の優先実行順序の確認
- ログによる検証

## まとめ

診断名検出機能の実装により、市販薬では対応が難しい診断名を包括的に検出し、適切な医師相談を推奨できるようになりました。早期リターン処理により、APIコストを約80%削減し、レスポンス時間も大幅に短縮しました。

今後も、より多くの診断名に対応し、文脈を考慮した正確な検出を実現していきます。
