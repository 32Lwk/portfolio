---
title: "緊急事案検出機能の詳細 - 誤検知防止機能を含む包括的な緊急事案検出システム"
description: "火災、医療緊急、不審者などの緊急事案を自動検出し、誤検知防止機能により医療相談の文脈を除外する機能の実装について"
date: "2025-12-29"
category: "プロジェクト"
tags: ["医薬品相談ツール", "セキュリティ", "医療AI"]
author: "川嶋宥翔"
featured: false
---

# 緊急事案検出機能の詳細 - 誤検知防止機能を含む包括的な緊急事案検出システム

火災、医療緊急、不審者などの緊急事案を自動検出する機能を実装しました。この記事では、誤検知防止機能により医療相談の文脈を除外する機能の実装について解説します。

## 開発の背景

ドラッグストアでの現場経験を通じて、以下のような緊急事案が発生する可能性があることを実感しました：

- **火災**: 火事、煙、燃えている
- **医療緊急**: 意識がない、呼吸困難、心停止
- **不審者**: 不審者、不審な行動、ストーカー
- **窃盗**: 盗まれた、万引き、泥棒

これらの緊急事案を検出し、適切な対応を促す必要がありました。

## 緊急事案検出の実装

### 1. 検出タイプの定義

```python
# src/core/emergency_detector.py
EMERGENCY_KEYWORDS = {
    # 火災（最優先）
    "fire": {
        "priority": 1,
        "keywords": [
            "火事", "煙", "燃えている", "発火", "火がついている",
            "火災", "炎", "火", "延焼", "全焼", "半焼", "焼失"
        ],
        "icon": "🔥",
        "color": "#d32f2f"  # 赤
    },
    
    # 刃物（優先度2）
    "weapon": {
        "priority": 2,
        "keywords": [
            "刃物", "ナイフ", "包丁", "ハサミ", "カッター",
            "銃", "ピストル", "ライフル", "サブマシンガン",
            "AK-47", "ドローン", "イージス艦", "空母", "大砲",
            "戦車", "ミサイル", "戦闘機", "ヘリコプター",
            "爆弾", "爆発物"
        ],
        "icon": "🔪",
        "color": "#d32f2f"  # 赤
    },
    
    # 医療緊急（優先度3）
    "medical_emergency": {
        "priority": 3,
        "keywords": [
            "意識がない", "呼吸困難", "心停止", "心肺停止",
            "心臓発作", "脳卒中", "ショック"
        ],
        "icon": "🚑",
        "color": "#d32f2f"  # 赤
    },
    
    # その他の緊急事案
    "violence": {
        "priority": 4,
        "keywords": ["暴れる", "暴行", "喧嘩", "殴る", "蹴る", "傷害", "殺人", "脅迫"],
        "icon": "👊",
        "color": "#d32f2f"  # 赤
    },
    
    "injured_person": {
        "priority": 5,
        "keywords": ["倒れている", "血が出ている", "けがをしている", "負傷", "出血", "大出血", "重傷", "軽傷", "応急処置"],
        "icon": "🚑",
        "color": "#f57c00"  # オレンジ
    },
    
    "suspicious_person": {
        "priority": 6,
        "keywords": ["不審者", "不審な人", "怪しい人", "変な人", "不審な行動", "尾行", "つけられている", "ストーカー", "つきまとい"],
        "icon": "🚓",
        "color": "#f57c00"  # オレンジ
    },
    
    "theft": {
        "priority": 7,
        "keywords": ["盗まれた", "盗まれました", "万引き", "泥棒", "窃盗", "空き巣", "スリ", "ひったくり", "置き引き", "車上荒らし", "自転車泥棒", "バイク泥棒", "車泥棒"],
        "icon": "🚔",
        "color": "#fbc02d"  # 黄色
    }
}
```

### 2. 緊急事案検出の実装

```python
def detect_emergency(user_text):
    """
    緊急事案を検出
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        emergency_result: 緊急事案検出結果
    """
    detected_emergencies = []
    
    # 誤検知防止: 医療相談の文脈をチェック
    is_medical_consultation = check_medical_consultation_context(user_text)
    
    for emergency_type, emergency_info in EMERGENCY_KEYWORDS.items():
        keywords = emergency_info.get("keywords", [])
        priority = emergency_info.get("priority", 99)
        
        detected_keywords = []
        for keyword in keywords:
            # 誤検知防止チェック
            if is_medical_consultation and should_exclude_keyword(keyword, user_text):
                continue
            
            if keyword in user_text:
                detected_keywords.append(keyword)
        
        if detected_keywords:
            detected_emergencies.append({
                "type": emergency_type,
                "priority": priority,
                "keywords": detected_keywords,
                "icon": emergency_info.get("icon", "🚨"),
                "color": emergency_info.get("color", "#d32f2f")
            })
    
    # 優先度が最も高い緊急事案を返す
    if detected_emergencies:
        highest_priority = min(detected_emergencies, key=lambda x: x["priority"])
        return highest_priority
    
    return None
```

## 誤検知防止機能

### 1. 医療用語の除外

医療用語（症状名・疾患名）に含まれる「炎」を除外：

```python
MEDICAL_TERMS_WITH_FIRE = [
    "口内炎", "胃炎", "結膜炎", "咽頭炎", "関節炎", "皮膚炎",
    "扁桃炎", "気管支炎", "肺炎", "膀胱炎", "尿道炎",
    # ... 50以上の医療用語
]

def should_exclude_keyword(keyword, user_text):
    """
    キーワードを除外すべきかチェック
    
    Args:
        keyword: 検出されたキーワード
        user_text: ユーザーの入力テキスト
    
    Returns:
        should_exclude: 除外すべきか
    """
    # 「炎」が医療用語の一部として使われている場合
    if keyword == "炎" or "炎" in keyword:
        for medical_term in MEDICAL_TERMS_WITH_FIRE:
            if medical_term in user_text:
                return True
    
    return False
```

### 2. 一般的な表現の除外

```python
GENERAL_EXPRESSIONS_TO_EXCLUDE = [
    "火曜日", "火を使う", "煙草", "鼻血", "歯茎からの出血",
    "生理の出血", "血圧", "血糖値"
]

def check_general_expressions(user_text):
    """
    一般的な表現をチェック
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        should_exclude: 除外すべきか
    """
    for expression in GENERAL_EXPRESSIONS_TO_EXCLUDE:
        if expression in user_text:
            return True
    
    return False
```

### 3. 医療相談の文脈判定

医療相談を示す表現を検出し、医療相談の文脈では特定のキーワードを除外：

```python
def check_medical_consultation_context(user_text):
    """
    医療相談の文脈をチェック
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        is_medical_consultation: 医療相談の文脈か
    """
    medical_consultation_keywords = [
        "症状", "薬", "相談", "教えて", "どうすれば",
        "効能", "副作用", "飲み合わせ"
    ]
    
    return any(keyword in user_text for keyword in medical_consultation_keywords)

def should_exclude_keyword_in_medical_context(keyword, user_text):
    """
    医療相談の文脈でキーワードを除外すべきかチェック
    
    Args:
        keyword: 検出されたキーワード
        user_text: ユーザーの入力テキスト
    
    Returns:
        should_exclude: 除外すべきか
    """
    if not check_medical_consultation_context(user_text):
        return False
    
    # 医療相談の文脈では特定のキーワードを除外
    excluded_keywords_in_medical_context = [
        "血", "出血", "救急車", "119番"
    ]
    
    # 「血が出ている」系は自分の症状として使われている場合は除外
    if keyword in ["血", "出血"]:
        if "人" not in user_text:
            return True  # 自分の症状として使われている
    
    # 「車を」「車が」が「救急車を」「救急車が」の一部として使われている場合は除外
    if keyword in ["車", "車を", "車が"]:
        if "救急車" in user_text:
            return True
    
    return keyword in excluded_keywords_in_medical_context
```

### 4. 文脈に基づく判定

```python
def check_contextual_exclusion(keyword, user_text):
    """
    文脈に基づく除外判定
    
    Args:
        keyword: 検出されたキーワード
        user_text: ユーザーの入力テキスト
    
    Returns:
        should_exclude: 除外すべきか
    """
    # 「助けて」系のキーワードは、相談の文脈がある場合のみ除外
    if keyword in ["助けて", "助け", "救急"]:
        consultation_keywords = ["相談", "教えて", "どうすれば"]
        if any(ckw in user_text for ckw in consultation_keywords):
            return True
    
    return False
```

## 優先度ベースの処理

複数の緊急事案が検出された場合、最も優先度の高いものを表示：

```python
def select_highest_priority_emergency(detected_emergencies):
    """
    最も優先度の高い緊急事案を選択
    
    Args:
        detected_emergencies: 検出された緊急事案のリスト
    
    Returns:
        highest_priority_emergency: 最も優先度の高い緊急事案
    """
    if not detected_emergencies:
        return None
    
    return min(detected_emergencies, key=lambda x: x["priority"])
```

## UI表示の実装

### 1. 緊急メッセージの生成

```python
def generate_emergency_message(emergency_result):
    """
    緊急メッセージを生成
    
    Args:
        emergency_result: 緊急事案検出結果
    
    Returns:
        emergency_message: 緊急メッセージ（HTML形式）
    """
    emergency_type = emergency_result["type"]
    icon = emergency_result["icon"]
    color = emergency_result["color"]
    
    # ヘッダーメッセージの分類
    if emergency_type in ["fire", "weapon", "violence", "suspicious_person"]:
        header_message = "安全を最優先にしてください。"
    else:
        header_message = "お近くのスタッフにご連絡ください。"
    
    html = f"""
    <div class="emergency-alert" style="border-left: 4px solid {color}; background-color: #ffebee; padding: 20px; margin: 15px 0; border-radius: 4px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 24px; margin-right: 10px;">{icon}</span>
            <strong style="color: {color}; font-size: 18px;">{header_message}</strong>
        </div>
        <div style="margin-left: 34px;">
            <p style="margin: 8px 0; font-size: 16px;">
                {get_emergency_instructions(emergency_type)}
            </p>
        </div>
    </div>
    """
    
    return html
```

### 2. 管理画面への統合

緊急事案は`/admin`の手動返信キューに自動追加：

```python
def add_to_emergency_queue(emergency_result, session_id, user_message):
    """
    緊急事案を管理画面のキューに追加
    
    Args:
        emergency_result: 緊急事案検出結果
        session_id: セッションID
        user_message: ユーザーのメッセージ
    """
    queue_item = {
        'session_id': session_id,
        'user_message': user_message,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'status': 'emergency_detected',
        'emergency_type': emergency_result['type'],
        'priority': 'high',
        'icon': emergency_result['icon'],
        'color': emergency_result['color']
    }
    
    add_to_manual_reply_queue(queue_item)
```

## トラブルシューティング

### 問題: 医療相談が緊急事案として誤検出される

**原因**: 誤検知防止機能が不十分

**解決策**: 
- 医療相談の文脈判定の強化
- 医療用語リストの拡充
- 文脈チェック範囲の拡大

### 問題: 緊急事案が見逃される

**原因**: キーワードリストが不足している

**解決策**: 
- キーワードリストの拡充
- 様々な表現パターンへの対応

### 問題: パフォーマンスの低下

**原因**: 誤検知防止チェックが重い

**解決策**: 
- 早期リターン処理
- キャッシュ機能の実装

## まとめ

緊急事案検出機能の実装により、火災、医療緊急、不審者などの緊急事案を自動検出できるようになりました。誤検知防止機能により、医療相談の文脈を適切に除外し、より正確な検出を実現しました。

今後も、より多くの緊急事案パターンに対応し、検出精度の向上を続けていきます。
