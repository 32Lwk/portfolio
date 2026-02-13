---
title: "SRP改善とコード品質向上 - リファクタリングの経験"
description: "Single Responsibility Principle (SRP) に基づいた大規模リファクタリング、コードの可読性とメンテナンス性の向上について"
date: "2026-02-08"
category: "プロジェクト"
tags: ["医薬品相談ツール", "開発記録"]
author: "川嶋宥翔"
featured: false
---

# SRP改善とコード品質向上 - リファクタリングの経験

コードの可読性とメンテナンス性を向上させるため、Single Responsibility Principle (SRP) に基づいた大規模リファクタリングを実施しました。この記事では、リファクタリングの背景、実装の詳細、そして学んだ教訓について解説します。

## リファクタリングの背景

### 課題

開発初期段階では、機能追加を優先していたため、以下のような問題が発生していました：

1. **巨大なファイル**: `chat_handler.py`が約2,641行、`rule_based_recommendation.py`が約1,580行
2. **責務の混在**: 1つのファイルに複数の責務が混在
3. **テストの困難**: 巨大なファイルのため、単体テストが困難
4. **可読性の低下**: コードの理解が困難

### SRPの適用

Single Responsibility Principle (SRP) に基づき、各モジュールが単一の責務を持つようにリファクタリング：

- **1つのクラス/モジュールは1つの理由で変更されるべき**
- **1つのクラス/モジュールは1つの責務を持つべき**

## リファクタリングの実装

### 1. app.pyのスリム化

**Before**: 約200行（ビュー定義を含む）

**After**: 約89行（アプリ作成・設定・エラーハンドラー登録・Blueprint登録・起動処理のみ）

```python
# app.py（リファクタリング後）
"""
Flask アプリケーションエントリポイント

責務: アプリ作成、設定（CORS・セッション・DB初期化）、エラーハンドラー登録、
 Blueprint の import と register、起動処理のみ。
"""
import logging
import os
from flask import Flask
from flask_cors import CORS

from config.app_config import load_env, configure_logging, get_cors_config
from src.services.database import init_database
from src.handlers.error_handlers import register_error_handlers

configure_logging()
load_env()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')

# CORS・セッション設定
cors_config = get_cors_config()
CORS(app, **cors_config)

# データベース初期化
init_database()

# エラーハンドラーを登録
register_error_handlers(app, session, VERSION)

# Blueprint登録
from src.routes import create_main_routes, create_admin_routes, create_api_routes

app.register_blueprint(create_main_routes())
app.register_blueprint(create_admin_routes())
app.register_blueprint(create_api_routes())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 2. ルートの責務分離

**Before**: すべてのルートが`app.py`に定義

**After**: 各ルートモジュールに分離

```python
# src/routes/main_routes.py
from flask import Blueprint, render_template

def create_main_routes():
    """
    メインルートのBlueprintを作成
    """
    bp = Blueprint('main', __name__)
    
    @bp.route('/')
    def index():
        return render_template('index.html')
    
    @bp.route('/about')
    def about():
        return render_template('about.html')
    
    return bp
```

```python
# src/routes/admin_routes.py
from flask import Blueprint, render_template

def create_admin_routes():
    """
    管理画面ルートのBlueprintを作成
    """
    bp = Blueprint('admin', __name__, url_prefix='/admin')
    
    @bp.route('/')
    def admin_dashboard():
        return render_template('admin/dashboard.html')
    
    return bp
```

### 3. rule_based_recommendationの分割

**Before**: 約1,580行の巨大なファイル

**After**: 以下のように分割

```
src/core/recommendation/
├── rule_based_recommendation.py  # オーケストレーション（約200行）
├── recommendation_constants.py   # 定数定義
├── life_stage_preference.py      # ライフステージ別の優先度
├── symptom_pattern_matcher.py    # 症状パターンマッチング
├── recommendation_finalizer.py   # 推奨結果の最終化
├── recommendation_scoring.py     # スコアリング
├── ingredient_diversity.py       # 成分多様性の確保
└── final_score_calculator.py     # 最終スコア計算
```

```python
# src/core/recommendation/rule_based_recommendation.py（リファクタリング後）
"""
ルールベース推奨システムのオーケストレーション

責務: 推奨フローの統括、各モジュールの呼び出し
"""
from src.core.recommendation.life_stage_preference import apply_life_stage_preferences
from src.core.recommendation.symptom_pattern_matcher import match_symptom_patterns
from src.core.recommendation.recommendation_scoring import calculate_scores
from src.core.recommendation.recommendation_finalizer import finalize_recommendations

def recommend_medicines(nlu_result, user_info, medicine_df):
    """
    医薬品を推奨（オーケストレーション）
    """
    # 1. 症状パターンマッチング
    matched_patterns = match_symptom_patterns(nlu_result)
    
    # 2. ライフステージ別の優先度適用
    candidates = apply_life_stage_preferences(candidates, user_info)
    
    # 3. スコアリング
    scored_candidates = calculate_scores(candidates, nlu_result, user_info)
    
    # 4. 推奨結果の最終化
    final_recommendations = finalize_recommendations(scored_candidates)
    
    return final_recommendations
```

### 4. chat_handlerの分割

**Before**: 約2,641行の巨大なファイル

**After**: 以下のように分割

```
src/handlers/chat/
├── chat_handler.py              # オーケストレーション（約300行）
├── chat_input_validator.py      # 入力検証・ブロック
├── chat_response_builder.py     # レスポンス構築
├── chat_triage.py               # トリアージ処理
├── chat_counseling_flow.py      # カウンセリングフロー
├── chat_recommendation_flow.py  # 推奨フロー
├── chat_manual_reply.py         # 手動返信処理
├── chat_emergency_handler.py    # 緊急事案処理
├── chat_diagnosis_handler.py    # 診断名処理
├── chat_store_inquiry.py        # 店舗案内処理
└── chat_triage_follow_ups.py    # トリアージフォローアップ
```

```python
# src/handlers/chat/chat_handler.py（リファクタリング後）
"""
チャットハンドラーのオーケストレーション

責務: チャットリクエストの統括、各モジュールの呼び出し
"""
from src.handlers.chat.chat_input_validator import validate_and_block_input
from src.handlers.chat.chat_triage import triage_user_input
from src.handlers.chat.chat_recommendation_flow import handle_recommendation_flow
from src.handlers.chat.chat_counseling_flow import handle_counseling_flow

def handle_chat_request(user_message, session, request, sid):
    """
    チャットリクエストを処理（オーケストレーション）
    """
    # 1. 入力検証
    sanitized_message, error_response = validate_and_block_input(
        session, request, user_message, sid
    )
    if error_response:
        return error_response
    
    # 2. トリアージ
    triage_result = triage_user_input(sanitized_message, session)
    
    # 3. カテゴリに応じた処理
    if triage_result['category'] == 'Physical':
        return handle_recommendation_flow(sanitized_message, session, sid)
    elif triage_result['category'] == 'Emotional':
        return handle_counseling_flow(sanitized_message, session, sid)
    # ... その他のカテゴリ
    
    return default_response
```

### 5. medicine_logicの分割

**Before**: 約215行（OpenAIクライアント初期化と医薬品推奨が混在）

**After**: 以下のように分割

```
src/core/medicine/
├── medicine_logic.py            # エントリポイント（約50行）
├── openai_client.py             # OpenAIクライアント初期化
├── medicine_recommendation_gpt.py  # GPTによる推奨
└── medicine_response_builder.py   # レスポンス構築
```

```python
# src/core/openai_client.py
"""
OpenAIクライアントの初期化

責務: OpenAIクライアントの作成と設定
"""
import openai
import os

_openai_client = None

def get_openai_client():
    """
    OpenAIクライアントを取得（シングルトン）
    """
    global _openai_client
    if _openai_client is None:
        _openai_client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY')
        )
    return _openai_client
```

### 6. counseling_responseの分割

**Before**: 約104行（テンプレート・ログ・プロンプト・生成が混在）

**After**: 以下のように分割

```
src/services/counseling/
├── counseling_response.py       # ファサード（約30行）
├── counseling_templates.py     # テンプレート定義
├── counseling_logger.py         # ログ記録
├── counseling_prompts.py        # プロンプト定義
├── counseling_generator.py      # 返信生成
├── counseling_questions.py     # 質問生成
├── counseling_satisfaction.py  # 満足度評価
├── counseling_summary.py        # 要約生成
├── counseling_topic_shift.py   # 話題転換
├── counseling_mode_control.py  # モード制御
└── counseling_processor.py     # プロセッサ
```

## scripts/とsrc/の役割分離

### scripts/フォルダ

開発・リファクタ用の補助スクリプト：

```
scripts/
├── build_api_routes.py      # APIルートの自動生成
├── extract_*.py            # コード抽出スクリプト
└── remove_*_views.py      # ビュー削除スクリプト
```

### src/フォルダ

アプリケーション本体（実行時にimportされる）：

```
src/
├── core/                   # コア機能
├── handlers/               # ハンドラー
├── routes/                 # ルート定義
├── services/               # サービス層
├── utils/                  # ユーティリティ
├── security/               # セキュリティ
└── analysis/               # 分析機能
```

## リファクタリングの効果

### コードの可読性

- **ファイルサイズ**: 平均500行以下に削減
- **責務の明確化**: 各モジュールの責務が明確
- **理解しやすさ**: コードの理解が容易に

### テストの容易性

- **単体テスト**: 各モジュールを独立してテスト可能
- **モック**: 依存関係が明確でモックが容易
- **カバレッジ**: テストカバレッジの向上

### メンテナンス性

- **変更の影響範囲**: 変更の影響範囲が明確
- **バグの特定**: バグの特定が容易
- **機能追加**: 新機能の追加が容易

## トラブルシューティング

### 問題: 循環インポートエラー

**原因**: モジュール間の依存関係が循環している

**解決策**: 
- 依存関係の見直し
- インターフェースの導入
- 遅延インポートの使用

### 問題: インポートパスの変更

**原因**: ファイルの移動によりインポートパスが変更

**解決策**: 
- 一括置換ツールの使用
- インポートパスの自動修正スクリプト

### 問題: テストの失敗

**原因**: リファクタリングによりテストが古くなる

**解決策**: 
- テストの更新
- リファクタリング前のテスト実行
- 段階的なリファクタリング

## 学んだ教訓

### 1. 早期のリファクタリング

機能追加を優先しすぎると、後でリファクタリングが困難になる。定期的なリファクタリングが重要。

### 2. SRPの徹底

1つのモジュールが複数の責務を持つと、変更の影響範囲が広がる。SRPを徹底することで、変更の影響を局所化できる。

### 3. テストの重要性

リファクタリング前にテストを実行し、リファクタリング後もテストが通ることを確認する。

### 4. 段階的なリファクタリング

一度にすべてをリファクタリングするのではなく、段階的に進めることで、リスクを最小化できる。

## 開発者としての想い

### リファクタリングの苦しみと喜び

リファクタリングは、**時間がかかり、大変な作業**でした。しかし、リファクタリング後は、コードの可読性とメンテナンス性が大幅に向上し、**開発効率が向上しました**。

**学んだこと**: 
- 早期のリファクタリングの重要性
- SRPを徹底することの重要性
- テストの重要性

### 「属人化しない仕組みを作る」

リファクタリングを通じて、**「属人化しない仕組みを作る」**ことの重要性を改めて実感しました。一人の理解に依存しないよう、責務分離・ログ・テスト・READMEを重視しています。

### 継続的な改善

リファクタリングは、**一度きりの作業ではありません**。継続的にコードの品質を向上させ、メンテナンス性を高めていく必要があります。

## まとめ

SRPに基づいたリファクタリングにより、コードの可読性とメンテナンス性を大幅に向上させました。各モジュールが単一の責務を持つことで、変更の影響範囲が明確になり、テストと機能追加が容易になりました。

**「属人化しない仕組みを作る」** - この信念を胸に、今後もコード品質の向上とリファクタリングを継続していきます。
