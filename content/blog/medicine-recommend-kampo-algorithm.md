---
title: "漢方薬推奨アルゴリズムの実装 - 34種類の漢方薬に対する詳細なルール"
description: "漢方薬の効能効果、適用症状、禁忌事項を考慮した推奨アルゴリズムの実装について"
date: "2025-11-22"
category: "プロジェクト"
tags: ["医薬品相談ツール", "アルゴリズム"]
author: "川嶋宥翔"
featured: false
---

# 漢方薬推奨アルゴリズムの実装 - 34種類の漢方薬に対する詳細なルール

漢方薬の効能効果、適用症状、禁忌事項を考慮した推奨アルゴリズムを実装しました。この記事では、34種類の漢方薬に対する詳細なルールの実装について解説します。

## 開発の背景

### 漢方薬の特殊性

漢方薬は、西洋薬とは異なる考え方に基づいています：

- **証（しょう）**: 患者の体質や症状のパターンに基づく診断
- **複数の生薬の組み合わせ**: 複数の生薬を組み合わせて効果を発揮
- **体質への配慮**: 患者の体質に応じた選択が重要

### 実装の動機

ドラッグストアでの現場経験を通じて、漢方薬の選択の難しさを実感しました。漢方薬は、症状だけでなく、**患者の体質や症状のパターン**を考慮する必要があります。

## 漢方薬データの構築

### 1. 漢方薬の分類

34種類の漢方薬を以下のカテゴリに分類：

```python
KAMPO_MEDICINES = {
    # 風邪・発熱系
    "葛根湯": {
        "efficacy": ["風邪", "発熱", "頭痛", "首の痛み", "肩こり"],
        "contraindications": ["虚弱体質", "胃腸虚弱"],
        "symptom_patterns": ["悪寒", "発熱", "頭痛", "首の痛み"]
    },
    
    # 胃腸系
    "六君子湯": {
        "efficacy": ["胃腸虚弱", "食欲不振", "胃もたれ"],
        "contraindications": [],
        "symptom_patterns": ["胃腸虚弱", "食欲不振", "胃もたれ"]
    },
    
    # その他の漢方薬
    # ... 34種類の漢方薬
}
```

### 2. 証（しょう）の判定

患者の体質や症状のパターンに基づく証の判定：

```python
def determine_sho(user_info, symptoms):
    """
    証（しょう）を判定
    
    Args:
        user_info: ユーザー情報
        symptoms: 症状リスト
    
    Returns:
        sho: 証（虚証、実証、中間証など）
    """
    # 体質の判定
    constitution = user_info.get('constitution', 'unknown')
    
    # 症状パターンの判定
    symptom_pattern = analyze_symptom_pattern(symptoms)
    
    # 証の判定
    if constitution == '虚弱' or '虚弱体質' in user_info.get('conditions', []):
        return '虚証'
    elif symptom_pattern == '急性':
        return '実証'
    else:
        return '中間証'
```

## 漢方薬推奨アルゴリズムの実装

### 1. 効能効果とのマッチング

```python
def match_kampo_efficacy(kampo_medicine, symptoms):
    """
    漢方薬の効能効果と症状のマッチング
    
    Args:
        kampo_medicine: 漢方薬の情報
        symptoms: 症状リスト
    
    Returns:
        match_score: マッチスコア（0.0-1.0）
    """
    efficacy_list = kampo_medicine.get('efficacy', [])
    symptom_names = [s.get('name') for s in symptoms]
    
    match_count = 0
    for efficacy in efficacy_list:
        if any(efficacy in symptom_name for symptom_name in symptom_names):
            match_count += 1
    
    if len(efficacy_list) > 0:
        match_score = match_count / len(efficacy_list)
    else:
        match_score = 0.0
    
    return match_score
```

### 2. 症状パターンのマッチング

```python
def match_symptom_patterns(kampo_medicine, symptoms):
    """
    症状パターンとのマッチング
    
    Args:
        kampo_medicine: 漢方薬の情報
        symptoms: 症状リスト
    
    Returns:
        pattern_score: パターンスコア（0.0-1.0）
    """
    required_patterns = kampo_medicine.get('symptom_patterns', [])
    symptom_names = [s.get('name') for s in symptoms]
    
    matched_patterns = 0
    for pattern in required_patterns:
        if any(pattern in symptom_name for symptom_name in symptom_names):
            matched_patterns += 1
    
    if len(required_patterns) > 0:
        pattern_score = matched_patterns / len(required_patterns)
    else:
        pattern_score = 0.0
    
    return pattern_score
```

### 3. 禁忌事項のチェック

```python
def check_kampo_contraindications(kampo_medicine, user_info):
    """
    漢方薬の禁忌事項をチェック
    
    Args:
        kampo_medicine: 漢方薬の情報
        user_info: ユーザー情報
    
    Returns:
        is_contraindicated: 禁忌かどうか
        reason: 禁忌の理由
    """
    contraindications = kampo_medicine.get('contraindications', [])
    
    for contraindication in contraindications:
        # 体質のチェック
        if contraindication in user_info.get('constitution', ''):
            return True, f"{contraindication}のため、この漢方薬は推奨できません"
        
        # 症状のチェック
        if contraindication in user_info.get('conditions', []):
            return True, f"{contraindication}のため、この漢方薬は推奨できません"
    
    return False, None
```

## 実装の詳細

### 1. 漢方薬のスコアリング

```python
def calculate_kampo_score(kampo_medicine, symptoms, user_info):
    """
    漢方薬のスコアを計算
    
    Args:
        kampo_medicine: 漢方薬の情報
        symptoms: 症状リスト
        user_info: ユーザー情報
    
    Returns:
        final_score: 最終スコア
    """
    # 1. 効能効果とのマッチング
    efficacy_score = match_kampo_efficacy(kampo_medicine, symptoms)
    
    # 2. 症状パターンとのマッチング
    pattern_score = match_symptom_patterns(kampo_medicine, symptoms)
    
    # 3. 証の判定
    sho = determine_sho(user_info, symptoms)
    sho_score = calculate_sho_score(kampo_medicine, sho)
    
    # 4. 禁忌事項のチェック
    is_contraindicated, reason = check_kampo_contraindications(
        kampo_medicine, user_info
    )
    
    if is_contraindicated:
        return -1.0, reason  # 禁忌の場合は負のスコア
    
    # 最終スコアの計算
    final_score = (efficacy_score * 0.4 + 
                   pattern_score * 0.4 + 
                   sho_score * 0.2)
    
    return final_score, None
```

### 2. 証に基づくスコアリング

```python
def calculate_sho_score(kampo_medicine, sho):
    """
    証に基づくスコアを計算
    
    Args:
        kampo_medicine: 漢方薬の情報
        sho: 証（虚証、実証、中間証など）
    
    Returns:
        sho_score: 証スコア（0.0-1.0）
    """
    # 漢方薬の適応証を取得
    applicable_sho = kampo_medicine.get('applicable_sho', [])
    
    if sho in applicable_sho:
        return 1.0
    elif '中間証' in applicable_sho and sho == '中間証':
        return 0.8
    else:
        return 0.3  # 証が合わない場合は減点
```

## 開発を通じて学んだこと

### 1. 漢方薬の複雑さ

漢方薬は、西洋薬とは異なる考え方に基づいており、**症状だけでなく、患者の体質や症状のパターン**を考慮する必要があります。

**学んだこと**: 
- 証（しょう）の概念を理解する重要性
- 複数の生薬の組み合わせによる効果
- 体質への配慮の重要性

### 2. ルールベースの重要性

漢方薬の推奨には、**明確なルール**が必要です。LLMだけに頼るのではなく、ルールベースのアルゴリズムを実装することで、より正確な推奨が可能になりました。

**学んだこと**: 
- ルールベースとLLMのハイブリッドアプローチの重要性
- 明確なルールの定義の重要性
- 禁忌事項の適切なチェック

### 3. データの重要性

漢方薬の推奨には、**正確なデータ**が必要です。効能効果、適用症状、禁忌事項などのデータを正確に収集・整理することが重要でした。

**学んだこと**: 
- データの正確性の重要性
- データの構造化の重要性
- データの継続的な更新の必要性

## トラブルシューティング

### 問題: 証の判定が難しい

**原因**: 証の判定には、患者の体質や症状のパターンを正確に把握する必要がある

**解決策**: 
- ユーザー情報から体質を推定
- 症状パターンを分析
- デフォルトで中間証として扱う

### 問題: 禁忌事項の判定が不十分

**原因**: 漢方薬の禁忌事項が複雑で、すべてを網羅するのが難しい

**解決策**: 
- 主要な禁忌事項を優先的にチェック
- ユーザー情報から体質を推定
- 不明な場合は医師への相談を推奨

### 問題: スコアリングの精度が低い

**原因**: 効能効果と症状のマッチングが不十分

**解決策**: 
- 同義語マッピングの拡充
- 症状パターンの詳細な分析
- 証に基づくスコアリングの改善

## まとめ

漢方薬推奨アルゴリズムの実装により、34種類の漢方薬に対する詳細なルールを統合しました。効能効果、適用症状、禁忌事項を考慮した推奨により、より適切な漢方薬の選択が可能になりました。

**漢方薬の複雑さを理解しながらも、継続的な改善により、より正確な推奨を実現できました。**

今後も、より多くの漢方薬に対応し、推奨精度の向上を続けていきます。
