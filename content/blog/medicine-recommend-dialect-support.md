---
title: "方言対応機能の実装 - 全国の方言を標準語に変換する自然言語処理"
description: "関西弁、東北弁、九州弁など100件以上の方言表現を標準語に変換し、症状を正確に抽出する機能の実装について"
date: "2025-12-31"
category: "プロジェクト"
tags: ["医薬品相談ツール", "LLM", "アクセシビリティ"]
author: "川嶋宥翔"
featured: false
---

# 方言対応機能の実装 - 全国の方言を標準語に変換する自然言語処理

全国のユーザーが使いやすいシステムを目指し、方言対応機能を実装しました。この記事では、関西弁、東北弁、九州弁など100件以上の方言表現を標準語に変換し、症状を正確に抽出する機能の実装について解説します。

## 開発の背景

ドラッグストアでの現場経験を通じて、方言による症状の表現の違いが、適切な医薬品推奨の障壁になっていることを実感しました。例えば：

- 「しんどい」（関西弁）→「疲労感」「だるさ」
- 「にえる」（名古屋弁）→「打ち身」「あざ」「炎症」
- 「はなげを出す」（九州弁）→「鼻水」

これらの方言表現を標準語に変換し、症状を正確に抽出する必要がありました。

## 実装のアプローチ

### 1. 方言辞書の構築

100件以上の方言表現を以下のカテゴリに分類：

```python
# 方言辞書の構造例
DIALECT_DICTIONARY = {
    # 疲労系
    "えらい": {
        "standard": ["疲労感", "だるさ", "倦怠感"],
        "weights": [0.4, 0.4, 0.2],
        "severity_tags": ["中等度"]
    },
    "しんどい": {
        "standard": ["疲労感", "だるさ", "倦怠感"],
        "weights": [0.5, 0.3, 0.2],
        "severity_tags": ["やや重度"]
    },
    
    # 痛み・炎症系
    "にえる": {
        "standard": ["打ち身", "打撲", "あざ", "炎症", "内出血"],
        "weights": [0.3, 0.3, 0.2, 0.1, 0.1],
        "severity_tags": ["中等度"]
    },
    "かじる": {
        "standard": ["痛み", "炎症"],
        "weights": [0.6, 0.4],
        "severity_tags": ["軽度"]
    },
    
    # 風邪・消化器系
    "はなげを出す": {
        "standard": ["鼻水", "鼻汁"],
        "weights": [0.8, 0.2],
        "severity_tags": []
    },
    "むかつく": {
        "standard": ["吐き気", "むかつき"],
        "weights": [0.7, 0.3],
        "severity_tags": []
    },
    
    # 強調語
    "めっちゃ": {
        "standard": [],
        "weights": [],
        "severity_tags": ["重度"],
        "escalation_score": 1.5
    },
    "でら": {
        "standard": [],
        "weights": [],
        "severity_tags": ["重度"],
        "escalation_score": 1.2
    }
}
```

### 2. 非破壊的変換

方言を複数の症状候補に展開し、重み付きで症状を抽出：

```python
def convert_dialect_to_symptoms(dialect_text):
    """
    方言を標準語の症状候補に変換（非破壊的）
    """
    detected_symptoms = []
    escalation_score = 0.0
    
    # Aho-Corasickアルゴリズムで高速検出
    automaton = build_dialect_automaton(DIALECT_DICTIONARY)
    
    for end_index, (dialect_word, dialect_info) in automaton.iter(dialect_text):
        start_index = end_index - len(dialect_word)
        
        # 標準語への展開
        standard_symptoms = dialect_info.get("standard", [])
        weights = dialect_info.get("weights", [])
        
        for symptom, weight in zip(standard_symptoms, weights):
            detected_symptoms.append({
                "name": symptom,
                "confidence": weight,
                "source": "dialect",
                "original_dialect": dialect_word
            })
        
        # 重症度タグの抽出
        severity_tags = dialect_info.get("severity_tags", [])
        for tag in severity_tags:
            detected_symptoms.append({
                "name": tag,
                "confidence": 0.5,
                "source": "dialect_severity",
                "original_dialect": dialect_word
            })
        
        # escalation_scoreの加算
        escalation_score += dialect_info.get("escalation_score", 0.0)
    
    # 重みの正規化（総症状エネルギー保存則）
    total_weight = sum(s.get("confidence", 0.0) for s in detected_symptoms)
    if total_weight > 1.0:
        normalization_factor = 1.0 / total_weight
        for symptom in detected_symptoms:
            symptom["confidence"] *= normalization_factor
    
    return detected_symptoms, escalation_score
```

### 3. パフォーマンス最適化

Aho-Corasickアルゴリズムと方言インデックスによるO(n)の高速処理：

```python
try:
    import ahocorasick
    AHO_CORASICK_AVAILABLE = True
except ImportError:
    AHO_CORASICK_AVAILABLE = False

def build_dialect_automaton(dialect_dict):
    """
    方言辞書からAho-Corasickオートマトンを構築
    """
    automaton = ahocorasick.Automaton()
    
    for dialect_word, dialect_info in dialect_dict.items():
        automaton.add_word(dialect_word, (dialect_word, dialect_info))
    
    automaton.make_automaton()
    return automaton
```

### 4. 誤検知防止

診断名のみ判定の改善：感情・状態に関する否定語を含む場合は診断名のみと判定しない：

```python
def is_diagnosis_only_with_exceptions(user_text, detected_diagnosis):
    """
    診断名のみ判定（例外ルール付き）
    """
    # 感情・状態に関する否定語
    negative_emotion_keywords = [
        "あかん", "つらい", "やばい", "しんどい", "きつい"
    ]
    
    # 否定語が含まれている場合は診断名のみと判定しない
    for keyword in negative_emotion_keywords:
        if keyword in user_text:
            return False
    
    return True
```

## 実装の詳細

### 方言対応の統合

```python
# src/core/scoring_utils.py
def initialize_dialect_resources():
    """
    方言変換リソースの初期化（アプリ起動時に一度だけ実行）
    """
    global _dialect_automaton, _dialect_index
    
    if AHO_CORASICK_AVAILABLE:
        _dialect_automaton = build_dialect_automaton(DIALECT_DICTIONARY)
        _dialect_index = create_dialect_index(DIALECT_DICTIONARY)
    else:
        logger.warning("pyahocorasickがインストールされていません。通常の正規表現を使用します。")
```

### 前処理ロジック

方言キーワードを検出し、症状を事前に推測：

```python
def preprocess_user_input(user_text):
    """
    ユーザー入力を前処理（方言変換）
    """
    # 基本正規化
    normalized_text = basic_normalize_text(user_text)
    
    # 方言検出と変換
    if AHO_CORASICK_AVAILABLE and _dialect_automaton:
        dialect_symptoms, escalation_score = convert_dialect_to_symptoms(normalized_text)
        
        # 症状をユーザー入力に追加（重み付き）
        for symptom in dialect_symptoms:
            # 症状をNLU結果に統合
            integrate_symptom_to_nlu_result(symptom)
        
        # escalation_scoreを加算
        add_escalation_score(escalation_score)
    
    return normalized_text
```

## 対応方言の例

### 関西弁

- **「えらい」**: 疲労感、だるさ、倦怠感
- **「しんどい」**: 疲労感、だるさ、倦怠感
- **「きつい」**: 疲労感、だるさ

### 名古屋弁

- **「にえる」**: 打ち身、打撲、あざ、炎症
- **「でら」**: 強調語（重度）

### 九州弁

- **「はなげを出す」**: 鼻水、鼻汁
- **「むかつく」**: 吐き気、むかつき

### 東北弁

- **「こわい」**: 疲労感、だるさ
- **「いびる」**: 痛み、炎症

## トラブルシューティング

### 問題: 方言が検出されない

**原因**: 方言辞書に該当する表現が登録されていない

**解決策**: 
- 方言辞書の拡充
- ユーザーフィードバックからの学習

### 問題: 誤検知（標準語が方言として検出される）

**原因**: 方言キーワードが標準語の一部として含まれている

**解決策**: 
- 単語境界を考慮したマッチング
- 文脈を考慮した判定

### 問題: パフォーマンスの低下

**原因**: Aho-Corasickアルゴリズムが使用されていない

**解決策**: 
- `pyahocorasick`パッケージのインストール
- 方言インデックスの最適化

## まとめ

方言対応機能の実装により、全国のユーザーが方言で症状を入力しても、正確に症状を抽出できるようになりました。Aho-Corasickアルゴリズムによる高速処理と、非破壊的変換による柔軟な症状抽出により、より使いやすいシステムを実現しました。

今後も、より多くの方言表現に対応し、ユーザーの多様な表現パターンに対応していきます。
