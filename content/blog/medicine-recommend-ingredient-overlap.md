---
title: "成分重複チェック機能の実装 - 30種類のリスク成分を検出し過剰摂取リスクを防止"
description: "推奨医薬品リスト内で成分重複をチェックし、深刻度レベル別の警告を表示する機能の実装について"
date: "2025-12-31"
category: "プロジェクト"
tags: ["医薬品相談ツール", "医療AI"]
author: "川嶋宥翔"
featured: false
---

# 成分重複チェック機能の実装 - 30種類のリスク成分を検出し過剰摂取リスクを防止

推奨医薬品リスト内で成分重複をチェックし、過剰摂取のリスクを防止する機能を実装しました。この記事では、30種類のリスク成分を検出し、深刻度レベル別の警告を表示する機能の実装について解説します。

## 開発の背景

複数の医薬品を同時に推奨する際、同じ成分が重複して含まれている場合、過剰摂取のリスクがあります。例えば：

- **アセトアミノフェン**: 複数の解熱鎮痛薬に含まれる
- **イブプロフェン**: 複数のNSAIDsに含まれる
- **抗ヒスタミン薬第一世代**: 複数の総合感冒薬に含まれる

これらの成分重複を検出し、適切な警告を表示する必要がありました。

## リスク成分マスターの構築

### 1. リスク成分の定義

30種類のリスク成分を以下の深刻度レベルで分類：

```python
RISK_INGREDIENTS_OVERLAP = {
    # Red（重複禁止）
    "アセトアミノフェン": {
        "severity": "red",
        "aliases": ["アセトアミノフェン", "パラセタモール", "acetaminophen"],
        "max_daily_dose": 4000,  # mg
        "warning_message": "アセトアミノフェンが重複しています。過剰摂取により肝障害のリスクがあります。"
    },
    "イブプロフェン": {
        "severity": "red",
        "aliases": ["イブプロフェン", "ibuprofen"],
        "max_daily_dose": 1200,  # mg
        "warning_message": "イブプロフェンが重複しています。過剰摂取により胃腸障害のリスクがあります。"
    },
    
    # Yellow（注意）
    "抗ヒスタミン薬第一世代": {
        "severity": "yellow",
        "aliases": ["クロルフェニラミン", "ジフェンヒドラミン", "diphenhydramine"],
        "warning_message": "抗ヒスタミン薬第一世代が重複しています。眠気が強く出る可能性があります。"
    },
    "カフェイン": {
        "severity": "yellow",
        "aliases": ["カフェイン", "caffeine"],
        "max_daily_dose": 500,  # mg
        "warning_message": "カフェインが重複しています。過剰摂取により不眠や動悸のリスクがあります。"
    },
    
    # Blue（情報）
    "ビタミンC": {
        "severity": "blue",
        "aliases": ["ビタミンC", "アスコルビン酸", "ascorbic acid"],
        "warning_message": "ビタミンCが重複しています。通常は問題ありませんが、過剰摂取にご注意ください。"
    }
}
```

### 2. 成分重複チェックの実装

```python
# src/core/ingredient_diversity.py
def check_ingredient_overlap(recommended_medicines):
    """
    推奨医薬品リスト内で成分重複をチェック
    
    Args:
        recommended_medicines: 推奨医薬品のリスト
    
    Returns:
        overlap_warnings: 成分重複の警告リスト
    """
    overlap_warnings = []
    
    # 各医薬品の成分を抽出
    medicine_ingredients = {}
    for medicine in recommended_medicines:
        ingredients_text = medicine.get('ingredients', '')
        ingredients_list = extract_ingredients(ingredients_text)
        medicine_ingredients[medicine['product_name']] = ingredients_list
    
    # リスク成分ごとにチェック
    for risk_name, risk_info in RISK_INGREDIENTS_OVERLAP.items():
        severity = risk_info.get("severity", "blue")
        aliases = risk_info.get("aliases", [])
        
        # 重複している医薬品を検出
        overlapping_medicines = []
        for medicine_name, ingredients_list in medicine_ingredients.items():
            # 集合演算による高速マッチング
            medicine_ingredients_set = set(ingredients_list)
            risk_aliases_set = set(aliases)
            
            if medicine_ingredients_set & risk_aliases_set:
                overlapping_medicines.append(medicine_name)
        
        # 2つ以上の医薬品で重複している場合、警告を追加
        if len(overlapping_medicines) >= 2:
            warning = {
                "risk_ingredient": risk_name,
                "severity": severity,
                "overlapping_medicines": overlapping_medicines,
                "warning_message": risk_info.get("warning_message", ""),
                "max_daily_dose": risk_info.get("max_daily_dose")
            }
            overlap_warnings.append(warning)
    
    return overlap_warnings
```

### 3. 成分の抽出

```python
def extract_ingredients(ingredients_text):
    """
    成分テキストから成分リストを抽出
    
    Args:
        ingredients_text: 成分テキスト（改行区切りまたはカンマ区切り）
    
    Returns:
        ingredients_list: 成分名のリスト
    """
    if not ingredients_text:
        return []
    
    # 改行とカンマの両方に対応
    ingredients_list = []
    for separator in ['\n', ',', '、']:
        if separator in ingredients_text:
            ingredients_list = [
                ing.strip() for ing in ingredients_text.split(separator) 
                if ing.strip()
            ]
            break
    
    if not ingredients_list:
        ingredients_list = [ingredients_text.strip()]
    
    # 成分名の正規化
    normalized_ingredients = []
    for ingredient in ingredients_list:
        normalized = normalize_ingredient_name(ingredient)
        normalized_ingredients.append(normalized)
    
    return normalized_ingredients
```

## 深刻度レベル別の警告表示

### 1. UI表示の実装

```python
def format_overlap_warnings(overlap_warnings):
    """
    成分重複警告をHTML形式でフォーマット
    
    Args:
        overlap_warnings: 成分重複の警告リスト
    
    Returns:
        formatted_html: HTML形式の警告メッセージ
    """
    if not overlap_warnings:
        return ""
    
    html_parts = []
    
    for warning in overlap_warnings:
        severity = warning.get("severity", "blue")
        risk_ingredient = warning.get("risk_ingredient", "")
        overlapping_medicines = warning.get("overlapping_medicines", [])
        warning_message = warning.get("warning_message", "")
        
        # 深刻度に応じたアイコンとボーダー色
        if severity == "red":
            icon = "🚨"
            border_color = "#d32f2f"  # 赤
            bg_color = "#ffebee"
        elif severity == "yellow":
            icon = "⚠️"
            border_color = "#f57c00"  # オレンジ
            bg_color = "#fff3e0"
        else:  # blue
            icon = "ℹ️"
            border_color = "#1976d2"  # 青
            bg_color = "#e3f2fd"
        
        # HTMLの生成
        html = f"""
        <div class="ingredient-overlap-warning" 
             style="border-left: 4px solid {border_color}; 
                    background-color: {bg_color}; 
                    padding: 15px; 
                    margin: 10px 0; 
                    border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 8px;">{icon}</span>
                <strong style="color: {border_color};">
                    成分重複警告: {risk_ingredient}
                </strong>
            </div>
            <div style="margin-left: 28px;">
                <p style="margin: 5px 0;">{warning_message}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">
                    重複している医薬品: {', '.join(overlapping_medicines)}
                </p>
            </div>
        </div>
        """
        html_parts.append(html)
    
    return "\n".join(html_parts)
```

### 2. 深刻度レベルの説明

- **Red（重複禁止）**: 過剰摂取により重篤な副作用のリスクがある成分
  - アセトアミノフェン、イブプロフェンなど
- **Yellow（注意）**: 過剰摂取により副作用が強く出る可能性がある成分
  - 抗ヒスタミン薬第一世代、カフェインなど
- **Blue（情報）**: 通常は問題ないが、過剰摂取に注意が必要な成分
  - ビタミンC、ビタミンB群など

## 集合演算による高速マッチング

Pythonの`set`演算を使用した効率的な成分重複検出：

```python
def check_ingredient_overlap_fast(recommended_medicines):
    """
    集合演算による高速な成分重複チェック
    """
    # 各医薬品の成分を集合として保持
    medicine_ingredient_sets = {}
    for medicine in recommended_medicines:
        ingredients_list = extract_ingredients(medicine.get('ingredients', ''))
        medicine_ingredient_sets[medicine['product_name']] = set(ingredients_list)
    
    # リスク成分のエイリアスを集合として保持
    risk_ingredient_sets = {}
    for risk_name, risk_info in RISK_INGREDIENTS_OVERLAP.items():
        aliases = risk_info.get("aliases", [])
        risk_ingredient_sets[risk_name] = set(aliases)
    
    # 集合演算による高速マッチング
    overlap_warnings = []
    for risk_name, risk_aliases_set in risk_ingredient_sets.items():
        overlapping_medicines = []
        
        for medicine_name, medicine_ingredients_set in medicine_ingredient_sets.items():
            # 集合の積集合を計算（O(min(len(set1), len(set2))))
            if medicine_ingredients_set & risk_aliases_set:
                overlapping_medicines.append(medicine_name)
        
        if len(overlapping_medicines) >= 2:
            warning = {
                "risk_ingredient": risk_name,
                "severity": RISK_INGREDIENTS_OVERLAP[risk_name].get("severity", "blue"),
                "overlapping_medicines": overlapping_medicines,
                "warning_message": RISK_INGREDIENTS_OVERLAP[risk_name].get("warning_message", "")
            }
            overlap_warnings.append(warning)
    
    return overlap_warnings
```

## 成分名の正規化

成分名の表記ゆれに対応するため、正規化辞書を使用：

```python
INGREDIENT_NORMALIZATION = {
    "アセトアミノフェン": ["アセトアミノフェン", "パラセタモール", "acetaminophen", "paracetamol"],
    "イブプロフェン": ["イブプロフェン", "ibuprofen", "イブ"],
    "ロキソプロフェン": ["ロキソプロフェン", "ロキソニン", "loxoprofen"],
    # ... その他の成分
}

def normalize_ingredient_name(ingredient):
    """
    成分名を正規化
    
    Args:
        ingredient: 元の成分名
    
    Returns:
        normalized_name: 正規化された成分名
    """
    ingredient_lower = ingredient.lower().strip()
    
    # 正規化辞書から検索
    for normalized_name, variations in INGREDIENT_NORMALIZATION.items():
        for variation in variations:
            if variation.lower() in ingredient_lower:
                return normalized_name
    
    return ingredient.strip()
```

## トラブルシューティング

### 問題: 成分が検出されない

**原因**: 成分名の表記ゆれやエイリアスの不足

**解決策**: 
- 成分名の正規化辞書の拡充
- エイリアスリストの追加

### 問題: 誤検出（異なる成分が同じとして検出される）

**原因**: 成分名の部分マッチング

**解決策**: 
- 単語境界を考慮したマッチング
- 成分名の完全一致チェック

### 問題: パフォーマンスの低下

**原因**: 線形検索による処理

**解決策**: 
- 集合演算による高速マッチング
- 成分インデックスの構築

## まとめ

成分重複チェック機能の実装により、推奨医薬品リスト内で成分重複を検出し、深刻度レベル別の警告を表示できるようになりました。集合演算による高速マッチングと、成分名の正規化により、より安全な医薬品推奨を実現しました。

今後も、より多くのリスク成分に対応し、過剰摂取リスクの防止を強化していきます。
