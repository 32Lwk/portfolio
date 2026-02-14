# ポートフォリオ兼ブログサイト

名古屋大学 理学部 物理学科に在籍する大学生、川嶋宥翔のポートフォリオ兼ブログサイトです。

**最終更新: 2026年2月14日**

## 技術スタック

- **Next.js 15** (App Router) - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **shadcn/ui** - UI コンポーネント
- **framer-motion** - アニメーション
- **next-themes** - ダークモード対応

## 機能

- **ポートフォリオ** - プロジェクト一覧・詳細（技術スタック、言語別割合、開発の歴史など）
- **ブログ** - Markdown / MDX による記事投稿
- **About** - 自己紹介、経歴、スキル、大会・賞歴（学歴セクションでテニスサーブの Canvas アニメーション）
- **Resume** - PDF ダウンロード対応
- **SEO** - サイトマップ、robots.txt、OGP
- **UI/UX** - ダークモード、レスポンシブデザイン

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## 環境変数

`.env.local` を作成し、必要に応じて以下を設定してください。

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 管理画面（Admin UI）

ブログの追加・編集や画像アップロードを行う管理画面は、**ローカル開発時のみ**利用できます。

- **有効化**: `.env.local` に `ENABLE_ADMIN=true` を設定し、`npm run dev` で起動する。
- **アクセス**: ブラウザで `http://localhost:3000/admin` を開く（ヘッダー・フッターにリンクは出しません）。
- **本番**: `ENABLE_ADMIN` を設定しないこと。本番ビルド・本番環境では `/admin` にアクセスすると 404 になり、一般公開されません。

## ディレクトリ構造

```
portfolio-site/
├── app/                # Next.js App Router（pages, layout, API）
├── components/         # React コンポーネント（ui, portfolio, blog, animations 等）
├── lib/                # ユーティリティ・データ取得（projects, blog, ai）
├── content/            # コンテンツ（ブログ, プロジェクト JSON）
└── public/             # 静的ファイル（画像等）
```

## ライセンス

MIT
