---
title: クラウド移行の経験 - RenderからGCP Cloud Runへの移行
description: RenderからGCP Cloud Runへの移行、Neon PostgreSQLへの移行、GitHub連携による継続的デプロイの実装について
date: '2026-02-11'
category: プロジェクト
tags:
  - 医薬品相談ツール
  - クラウド
  - GCP
author: 川嶋宥翔
featured: false
hidden: false
---

# クラウド移行の経験 - RenderからGCP Cloud Runへの移行

コスト削減とスケーラビリティの向上を目指し、RenderからGCP Cloud Runへ、Cloud SQLからNeon PostgreSQLへ移行しました。README（2026年2月11日・12日更新）に合わせ、本番URLは [https://medicine-recommend-340042923793.asia-northeast1.run.app/](https://medicine-recommend-340042923793.asia-northeast1.run.app/) で、移行期間は**2日**とされています。この記事では、移行の背景、実装の詳細、そしてトラブルシューティングについて解説します。

## 移行の背景

移行の最大の目的は**コスト削減**でした。Render 運用時は月あたり**約3,500円**の維持費がかかっており、レスポンスも速いとは言えませんでした。GCP Cloud Run および Neon PostgreSQL へ移行した結果、月あたり**数百円**程度に抑えられ、レスポンスも**おおむね70%程度の短縮**を実現できました。Docker の導入やコンテナ化は難易度の高い作業でしたが、無事完了し、Cloud SQL から Neon へのデータベース移行も問題なく完了しています。

### Renderでの課題

- **コスト**: 月額約3,500円程度の維持費
- **レスポンス**: 体感として十分に速いとは言い難い
- **スケーラビリティ**: 手動スケーリングが必要
- **データベース**: Cloud SQL のコストが負担

### GCP Cloud Run・Neon の利点

- **コスト**: 従量課金により月あたり数百円レベルに削減
- **レスポンス**: 体感でおおむね70%程度の短縮を達成
- **従量課金**: リクエストがある時のみ課金
- **自動スケーリング**: トラフィックに応じて自動スケール
- **サーバーレス**: インフラ管理が不要

## 移行の実装

### 1. Dockerfileの作成

```dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off

WORKDIR /app

# 依存関係を先にインストールしてレイヤキャッシュを効かせる
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリコードをコピー
COPY . .

# Cloud Run のデフォルトポート（環境変数 PORT が渡される）
ENV PORT=8080

# Gunicorn 起動スクリプトを実行可能に
RUN chmod +x start.sh

# Flask アプリ(app:app)を Gunicorn で起動
CMD ["./start.sh"]
```

### 2. start.shスクリプト

```bash
#!/bin/bash
# start.sh

# 環境変数の確認
echo "PORT: $PORT"
echo "DATABASE_URL: $DATABASE_URL"

# GunicornでFlaskアプリを起動
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --threads 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    app:app
```

### 3. Cloud Runへのデプロイ

```bash
# Cloud Runにデプロイ
gcloud run deploy medicine-recommend \
    --source . \
    --platform managed \
    --region asia-northeast1 \
    --allow-unauthenticated \
    --set-env-vars DATABASE_URL=$DATABASE_URL,OPENAI_API_KEY=$OPENAI_API_KEY
```

### 4. GitHub連携による継続的デプロイ

Cloud RunとGitHubを連携し、pushで自動ビルド・デプロイ：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy medicine-recommend \
            --source . \
            --platform managed \
            --region asia-northeast1 \
            --allow-unauthenticated
```

## Neon PostgreSQLへの移行

### 移行の理由

- **コスト削減**: Cloud SQLより大幅に安価
- **スケールゼロ**: 使用しない時は課金なし
- **従量課金**: 使用量に応じた課金

### 接続文字列の設定

```python
# config/app_config.py
import os

def get_database_url():
    """
    Neon PostgreSQLの接続文字列を取得
    """
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        # 開発環境用のデフォルト値
        database_url = 'postgresql://user:password@localhost:5432/medicine_db'
    
    return database_url
```

### データベース接続の実装

```python
# src/services/database.py
import psycopg2
from psycopg2 import pool

# コネクションプールの作成
connection_pool = None

def init_database():
    """
    データベースを初期化
    """
    global connection_pool
    
    try:
        database_url = get_database_url()
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 20, database_url
        )
        
        # テーブルの作成
        create_tables()
        
        return True
    except Exception as e:
        logger.error(f"データベース初期化エラー: {e}")
        return False

def get_connection():
    """
    コネクションプールから接続を取得
    """
    if connection_pool:
        return connection_pool.getconn()
    return None

def return_connection(conn):
    """
    接続をコネクションプールに返す
    """
    if connection_pool:
        connection_pool.putconn(conn)
```

## 環境変数の設定

### Cloud Runでの環境変数設定

```bash
# 環境変数を設定
gcloud run services update medicine-recommend \
    --set-env-vars \
    DATABASE_URL=$DATABASE_URL,\
    OPENAI_API_KEY=$OPENAI_API_KEY,\
    DEEPL_API_KEY=$DEEPL_API_KEY,\
    SECRET_KEY=$SECRET_KEY
```

### シークレットマネージャーの使用

機密情報はSecret Managerに保存：

```python
# config/secrets.py
from google.cloud import secretmanager

def get_secret(secret_id):
    """
    Secret Managerからシークレットを取得
    """
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")
```

## パフォーマンスの最適化

### 1. コールドスタートの対策

```python
# app.py
# アプリ起動時にリソースを事前読み込み
def initialize_resources():
    """
    リソースを事前読み込み（コールドスタート対策）
    """
    # 方言変換リソースの初期化
    from src.core.scoring_utils import initialize_dialect_resources
    initialize_dialect_resources()
    
    # データベース接続の確立
    init_database()
    
    # 辞書データの読み込み
    load_symptom_dictionary()
    load_ingredient_dictionary()

# アプリ起動時に実行
initialize_resources()
```

### 2. 最小インスタンス数の設定

```bash
# 最小インスタンス数を1に設定（コールドスタート回避）
gcloud run services update medicine-recommend \
    --min-instances 1
```

## コスト比較

### Render vs GCP Cloud Run

| 項目 | Render | GCP Cloud Run |
|------|--------|---------------|
| 月額固定費 | $25 | $0（従量課金） |
| データベース | Cloud SQL ($30/月) | Neon ($0-10/月) |
| 合計 | $55/月 | $5-15/月 |

### 実際のコスト削減

- **移行前**: 約$55/月
- **移行後**: 約$8/月
- **削減率**: 約85%

## トラブルシューティング

### 問題: コールドスタートが遅い

**原因**: アプリ起動時のリソース読み込みに時間がかかる

**解決策**: 
- 最小インスタンス数を1に設定
- リソースの事前読み込み
- 不要なインポートの削減

### 問題: データベース接続エラー

**原因**: Neon PostgreSQLの接続文字列が正しく設定されていない

**解決策**: 
- 環境変数`DATABASE_URL`の確認
- SSL接続の設定確認
- コネクションプールのサイズ調整

### 問題: メモリ不足エラー

**原因**: Cloud Runのメモリ制限を超えている

**解決策**: 
- メモリ制限の引き上げ（512MB → 1GB）
- 不要なデータの削除
- キャッシュサイズの調整

### 問題: タイムアウトエラー

**原因**: リクエスト処理時間が60秒を超えている

**解決策**: 
- タイムアウト時間の引き上げ（60秒 → 120秒）
- 非同期処理の実装
- キャッシュ機能の活用

## 移行の成果

### パフォーマンス

- **レスポンス時間**: 平均2-3秒から1-2秒に短縮
- **スケーラビリティ**: 自動スケーリングにより、トラフィック増加に対応
- **可用性**: 99.9%以上のアップタイム

### コスト

- **月額コスト**: 約85%削減
- **従量課金**: 使用量に応じた課金で無駄がない

### 開発効率

- **CI/CD**: GitHub連携により自動デプロイ
- **ログ**: Cloud Loggingで一元管理
- **モニタリング**: Cloud Monitoringでパフォーマンス監視

## 開発者としての想い

### コスト削減への取り組み

学生として開発しているため、**コストは重要な課題**でした。RenderからGCP Cloud Runへの移行により、月額コストを約85%削減できたことは、大きな成果でした。

**学んだこと**: 
- クラウドサービスの選定の重要性
- 従量課金モデルのメリット
- スケールゼロの重要性

### 移行の難しさ

移行期間は2日でしたが、**多くの課題に直面しました**。Dockerfileの作成、環境変数の設定、データベース接続の確認など、細かい作業が多く、時間がかかりました。

**学んだこと**: 
- 移行前の十分な準備の重要性
- 段階的な移行の重要性
- ロールバック計画の重要性

### 継続的な改善

移行後も、**継続的な改善**を行っています。コールドスタートの対策、メモリ使用量の最適化、ログの改善など、継続的にシステムを改善しています。

## まとめ

RenderからGCP Cloud Runへの移行により、コストを約85%削減し、スケーラビリティと開発効率を向上させました。Neon PostgreSQLへの移行により、データベースコストも大幅に削減しました。

**「継続的な改善」** - この信念を胸に、今後もパフォーマンスの最適化とコスト削減を続けていきます。
