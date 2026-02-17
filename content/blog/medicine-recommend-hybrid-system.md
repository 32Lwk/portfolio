---
title: ハイブリッド推奨システムの技術詳細
description: ルールベースとLLMを融合した、安全性と精度を両立する医薬品推奨システムのアーキテクチャと実装について
date: '2025-11-05'
category: プロジェクト
tags:
  - 医薬品相談ツール
  - アルゴリズム
  - LLM
author: 川嶋宥翔
featured: true
hidden: false
---

# ハイブリッド推奨システムの技術詳細

単純なLLMベースの推奨では、安全性と正確性に課題があるため、ルールベースとLLMを組み合わせたハイブリッド推奨システムを採用しました。この記事では、システムのアーキテクチャと実装の詳細について解説します。

## システムアーキテクチャ

### 1. 二段階スコアリングシステム

システムは以下の2段階で推奨を行います：

1. **ルールベース推奨**: 全医薬品種類に対して透明性の高いルールベースアルゴリズムを適用
2. **LLMによる補完**: NLU（自然言語理解）段階でのみLLMを使用（症状抽出の信頼度が低い場合）

### 2. スコアリングの流れ

```python
# スコアリングの主要な流れ（簡略化）
def calculate_recommendation_score(candidate, nlu_result, user_info):
    # 1. 基本スコア
    base_score = 0.0
    
    # 2. 効能特異性スコア
    efficacy_score = calculate_efficacy_specificity_score(candidate, nlu_result)
    
    # 3. 副作用リスクスコア
    side_effect_score = calculate_side_effect_risk_score(candidate, user_info)
    
    # 4. 相互作用リスクスコア
    interaction_score = calculate_interaction_risk_score(candidate, user_info)
    
    # 5. 用法簡便性スコア
    convenience_score = calculate_usage_convenience_score(candidate)
    
    # 6. 調整スコア（症状特異性、年齢制限など）
    adjustment_score = calculate_adjustment_score(candidate, nlu_result, user_info)
    
    # 最終スコア
    final_score = base_score + efficacy_score + side_effect_score + \
                  interaction_score + convenience_score + adjustment_score
    
    return final_score
```

## 効能特異性スコアの計算

効能特異性スコアは、医薬品の効能効果が症状に特化しているほど高スコアになります。

### 実装のポイント

```python
def calculate_efficacy_specificity_score(candidate, nlu_result):
    """
    効能特異性スコアを計算
    医薬品の効能効果が症状に特化しているほど高スコア
    """
    efficacy_text = candidate.get('efficacy', '')
    symptoms = nlu_result.get("symptoms", [])
    
    # 症状名のリストを作成
    symptom_names = [s.get('name', '') for s in symptoms]
    
    # 効能テキストを正規化
    normalized_efficacy = normalize_text(efficacy_text)
    
    # 症状とのマッチング（単語境界を考慮）
    match_count = 0
    for symptom_name in symptom_names:
        normalized_symptom = normalize_text(symptom_name)
        if is_word_match(normalized_symptom, normalized_efficacy):
            match_count += 1
    
    # 特異性比率を計算
    specificity_ratio = match_count / len(symptom_names) if symptom_names else 0.0
    
    return specificity_ratio
```

### 同義語マッピングの拡張

症状の様々な表現パターンに対応するため、同義語マッピングを実装しました：

```python
symptom_synonyms = {
    "たん": ["たん", "痰", "タン", "たんが出る", "痰が出る", "喀痰", "咳痰", 
             "のどにからむ", "喉に絡む", "からむ", "絡む", "ゼロゼロ", "ゼーゼー"],
    "せき": ["せき", "咳", "セキ", "せきが出る", "咳が出る", "咳嗽", "咳込む"],
    # ... その他の症状
}
```

### 誤検知防止機能

短単語（2文字以下）の誤検知を防止するため、ブラックリストによる局所判定を実装：

```python
TANN_FALSE_POSITIVE_BLACKLIST = [
    "簡単", "かんたん", "カンタン",
    "負担", "ふたん", "フタン",
    "短期間", "たんきかん", "タンキカン",
    # ... その他のブラックリスト
]

def is_word_match(token, text, blacklist=None):
    """
    単語境界を考慮したマッチング（ブラックリストチェック統合版）
    """
    # ブラックリストチェック（短単語の場合・局所判定）
    if blacklist and len(token) <= 2:
        # 座標計算による局所判定
        # ...
    
    # 単語境界チェック
    # ...
```

## 症状特異性ペナルティ

単一症状時に複合薬（総合感冒薬など）にペナルティを適用し、特化薬を優先します：

```python
# 単一症状時の推奨ロジック
if len(symptom_names) == 1:
    symptom = symptom_names[0]
    
    if symptom == "発熱":
        # 解熱鎮痛薬を優先
        if "総合風邪薬" in medicine_type:
            penalty = -0.5  # 総合風邪薬にはペナルティ
    
    elif symptom == "のどの痛み":
        # 外用薬（のど）を最優先
        if "外用薬（のど）" in medicine_type:
            bonus = +0.15
        elif "総合風邪薬" in medicine_type:
            penalty = -0.15
```

## 主要解熱鎮痛薬の優先推奨

カロナールA、ロキソニンS、タイレノールAを第一選択として推奨するため、ボーナススコアを設定：

```python
MAJOR_ANALGESIC_MEDICINES = [
    "カロナールA", "タイレノールA", "ロキソニンS"
]

# 主要解熱鎮痛薬のボーナス
if product_name in MAJOR_ANALGESIC_MEDICINES:
    if "頭痛" in symptoms or "発熱" in symptoms:
        bonus = +0.8  # カロナールA/タイレノールA
    elif "筋肉痛" in symptoms:
        bonus = +0.6  # ロキソニンS
```

## LLMの使用タイミング

LLMは以下の場合のみ使用します：

1. **NLU段階**: ルールベースNLUの信頼度が低い場合（症状0個または信頼度0.3未満）
2. **症状詳細質問生成**: 推奨前に症状とユーザー情報のみを考慮して質問を生成

### 実装例

```python
def select_symptoms_via_gpt(user_text, conversation_history):
    """
    ChatGPT APIを使用して症状を抽出
    ルールベースNLUの信頼度が低い場合のみ実行
    """
    if nlu_confidence >= 0.3 and len(symptoms) > 0:
        return symptoms  # ルールベースの結果を使用
    
    # ChatGPT APIを呼び出し
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "症状抽出プロンプト"},
            {"role": "user", "content": user_text}
        ]
    )
    
    return extract_symptoms_from_response(response)
```

## パフォーマンス最適化

### 1. 二段階スコアリング

全候補に対して詳細なスコアリングを行うのではなく、まず簡易スコアリングで候補を絞り込み、その後詳細スコアリングを実行：

```python
# 第1段階: 簡易スコアリング（高速）
candidates = get_candidate_medicines(nlu_result, medicine_df)
candidates = filter_by_efficacy_symptom_match(candidates, nlu_result)

# 第2段階: 詳細スコアリング（高精度）
for candidate in candidates:
    score = calculate_recommendation_score(candidate, nlu_result, user_info)
    candidate['final_score'] = score
```

### 2. キャッシュ機能

同一入力に対するLLMトリアージ結果をキャッシュし、パフォーマンスを向上：

```python
_triage_cache = {}

def get_triage_result(user_text):
    cache_key = hash(user_text)
    if cache_key in _triage_cache:
        return _triage_cache[cache_key]
    
    result = llm_triage(user_text)
    _triage_cache[cache_key] = result
    return result
```

## トラブルシューティング

### 問題: 効能特異性スコアが0.0になる

**原因**: 症状名と効能テキストの表記ゆれ（全角・半角、ひらがな・カタカナ）

**解決策**: 
- `normalize_text()`関数でNFKC正規化・小文字化
- 同義語マッピングの拡張
- 単語境界を考慮したマッチング

### 問題: 誤検知（「たん」が「簡単」の一部として検出される）

**原因**: 短単語の部分マッチング

**解決策**: 
- ブラックリストによる局所判定
- 座標計算による正確な判定

### 問題: 単一症状時に総合感冒薬が推奨される

**原因**: 症状特異性ペナルティが不十分

**解決策**: 
- 単一症状時のペナルティを強化（-0.7）
- 効能特異性によるペナルティ緩和ロジックの実装

## 開発者としての想い

### ルールベースとLLMのバランス

ハイブリッド推奨システムを実装する際、**ルールベースとLLMのバランス**を取ることが最も難しい課題でした。

LLMだけに頼ると、安全性に課題があります。一方、ルールベースだけでは、ユーザーの多様な表現に対応できません。

**解決策**: 
- ルールベースを基本とし、LLMは補完的に使用
- NLU段階でのみLLMを使用（症状抽出の信頼度が低い場合）
- 推奨段階ではルールベースのみを使用

### 「なぜこの結果になったか」を説明できる設計

医療情報システムとして、**推奨の根拠を説明できる**ことが重要です。ルールベースのアルゴリズムにより、なぜその医薬品が推奨されたのかを明確に説明できます。

### 継続的な改善

アルゴリズムの改善は、**継続的なプロセス**です。ユーザーフィードバックを基に、スコアリングのパラメータを調整し、推奨精度を向上させています。

## まとめ

ハイブリッド推奨システムにより、安全性と精度を両立した医薬品推奨を実現しました。ルールベースの透明性とLLMの柔軟性を組み合わせることで、より適切な推奨が可能になりました。

**「なぜこの結果になったか」を説明できる設計** - この信念を胸に、今後もより多くの相談事例データを蓄積し、アルゴリズムの改善を続けていきます。
