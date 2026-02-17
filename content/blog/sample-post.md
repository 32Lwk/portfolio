---
title: ポートフォリオサイトを構築しました
description: Next.js 16、TypeScript、Tailwind CSS 4を使用して、モダンで洗練されたポートフォリオ兼ブログサイトを構築した過程と学びを紹介します。
date: '2026-02-12'
category: プロジェクト
tags:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - ポートフォリオ
author: 川嶋宥翔
slug: sample-post
featured: true
draft: false
hidden: false
---

# ポートフォリオサイトを構築しました

この記事では、Next.js 16、TypeScript、Tailwind CSS 4を使用してポートフォリオ兼ブログサイトを構築した過程、技術的な実装の詳細、そして学びを紹介します。

## プロジェクトの背景

名古屋大学理学部物理学科に在籍しながら、フルスタックエンジニアとして活動する中で、自分の作品や経験をまとめて発信する場が必要だと感じていました。特に、チャット型医薬品相談ツールの開発経験や、医療×AI分野での取り組みを、技術的な詳細とともに紹介したいと考えていました。

また、ブログ機能も兼ねることで、日々の学習記録や技術的な学び、コンテスト参加の経験なども発信できるようにしました。

## 技術スタック

### フロントエンド

- **Next.js 16.1.6** (App Router) - Reactフレームワーク
- **React 19.2.3** - UIライブラリ
- **TypeScript 5.x** - 型安全性
- **Tailwind CSS 4.x** - ユーティリティファーストのCSSフレームワーク
- **shadcn/ui** - アクセシブルなUIコンポーネントライブラリ
- **framer-motion 12.34.0** - アニメーションライブラリ
- **next-themes 0.4.6** - ダークモード対応

### コンテンツ管理

- **gray-matter 4.0.3** - Markdownフロントマター解析
- **next-mdx-remote 6.0.0** - MDXレンダリング
- **date-fns 4.1.0** - 日付フォーマット

### 開発ツール

- **ESLint** - コード品質チェック
- **tsx 4.7.0** - TypeScript実行環境

### デプロイ・インフラ

- **Vercel** - ホスティング（静的サイト生成）
- **GitHub** - ソースコード管理、CI/CD

## 主な機能

### 1. ポートフォリオ機能

プロジェクト一覧と詳細ページを実装しました。各プロジェクトには以下の情報を表示しています：

- プロジェクト名・説明
- 使用技術スタック
- GitHub URL・デモ URL
- ハイライトポイント
- 開発期間

プロジェクトデータは `content/projects/projects.json` で管理し、TypeScriptの型定義により型安全性を確保しています。

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  category: "Web Application" | "Algorithm" | "Infrastructure";
  technologies: string[];
  image?: string;
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  date: {
    start: string; // YYYY-MM
    end?: string;
  };
  highlights: string[];
}
```

### 2. ブログ機能

Markdown/MDX形式でブログ記事を管理しています。主な特徴：

- **フロントマター**: タイトル、説明、日付、カテゴリ、タグなどをYAML形式で定義
- **MDXサポート**: ReactコンポーネントをMarkdown内で使用可能
- **シンタックスハイライト**: `react-syntax-highlighter`を使用したコードブロックのハイライト
- **記事一覧**: カテゴリ・タグでのフィルタリング機能

ブログ記事は `content/blog/` ディレクトリに配置し、`gray-matter`でフロントマターを解析、`next-mdx-remote`でレンダリングしています。

### 3. Aboutページ

自己紹介、経歴、スキル、大会・賞歴をタイムライン形式で表示しています。特に、学歴セクションには**テニスサーブのCanvasアニメーション**を実装し、中高時代のテニス部経験を視覚的に表現しました。

### 4. Resumeページ

PDF形式の履歴書をダウンロードできる機能を実装しました。LaTeXで作成した履歴書をPDFに変換し、`/public/resume/`に配置しています。

### 5. SEO最適化

以下のSEO対策を実装しました：

- **メタデータ**: 各ページに適切なtitle、description、keywordsを設定
- **OGPタグ**: Open Graph ProtocolによるSNS共有対応
- **Twitter Card**: Twitterでの共有時の最適化
- **JSON-LD構造化データ**: Person、Article、WebSite、Projectのスキーマを実装
- **サイトマップ自動生成**: `app/sitemap.ts`で動的に生成
- **robots.txt自動生成**: `app/robots.ts`で動的に生成

### 6. パフォーマンス最適化

- **Next.js Image最適化**: WebP/AVIF形式への自動変換、遅延読み込み
- **コード分割**: 動的インポートによる必要なコードのみの読み込み
- **フォント最適化**: `next/font`を使用したフォントの最適化
- **静的サイト生成（SSG）**: ビルド時にHTMLを生成し、高速な表示を実現

### 7. アクセシビリティ

WCAG AA準拠を意識した実装を行いました：

- **キーボードナビゲーション**: すべてのインタラクティブ要素がキーボードで操作可能
- **スクリーンリーダー対応**: 適切な`aria-label`、`aria-describedby`の設定
- **セマンティックHTML**: 適切なHTML要素の使用
- **コントラスト比**: テキストと背景のコントラスト比を確保

### 8. ダークモード対応

`next-themes`を使用してダークモードを実装しました。ユーザーのシステム設定に応じて自動的に切り替わり、手動での切り替えも可能です。

## 技術的な実装の詳細

### 画像最適化の設定

`next.config.ts`で画像最適化の設定を行いました：

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

- **リモート画像対応**: `remotePatterns`で外部画像の読み込みを許可
- **SVG対応**: `dangerouslyAllowSVG`でSVG画像の読み込みを許可（セキュリティポリシーと併用）
- **フォーマット最適化**: AVIF、WebP形式への自動変換
- **レスポンシブ画像**: デバイスサイズに応じた最適な画像サイズの提供

### ブログ記事の管理

ブログ記事はMarkdownファイルとして管理し、以下のような構造になっています：

```markdown
---
title: 記事タイトル
description: 記事の説明
date: '2026-02-12'
category: 技術
tags:
  - Next.js
  - TypeScript
author: 川嶋宥翔
slug: article-slug
featured: true
hidden: false
---

# 記事本文

...
```

`lib/blog.ts`で記事の読み込みとパースを行い、`app/blog/[slug]/page.tsx`で動的ルーティングにより各記事を表示しています。

### 管理画面（Admin UI）

ローカル開発時のみ利用できる管理画面を実装しました：

- **有効化**: `.env.local`に`ENABLE_ADMIN=true`を設定
- **機能**: ブログ記事の追加・編集、画像アップロード
- **セキュリティ**: 本番環境では`/admin`にアクセスすると404を返す

## 学びと課題

### 学んだこと

1. **Next.js App Routerの理解**: App Routerのルーティング、レイアウト、メタデータの設定方法を学びました。

2. **TypeScriptの型安全性**: プロジェクトデータやブログ記事の型定義により、コンパイル時にエラーを検出できるようになりました。

3. **SEO最適化の重要性**: 構造化データやOGPタグの設定により、検索エンジンでの表示が改善されました。

4. **アクセシビリティの実装**: WCAG準拠を意識した実装により、より多くのユーザーにアクセス可能なサイトになりました。

5. **パフォーマンス最適化**: 画像最適化やコード分割により、ページの読み込み速度が向上しました。

### 課題と今後の改善予定

1. **テストの不足**: 現在、ユニットテストやE2Eテストが不足しています。今後、JestやPlaywrightなどを導入してテストを追加する予定です。

2. **パフォーマンスの測定**: Lighthouseなどのツールを使用して、定期的にパフォーマンスを測定し、改善していく必要があります。

3. **コンテンツの充実**: ブログ記事の数を増やし、より多様なコンテンツを提供していきたいです。

4. **多言語対応**: 将来的には英語版も追加し、より多くのユーザーにアクセスしてもらえるようにしたいです。

5. **AI機能の追加**: 記事要約機能や、AIによる記事推薦機能などの追加を検討しています。

## まとめ

Next.js 16、TypeScript、Tailwind CSS 4を使用して、モダンで洗練されたポートフォリオ兼ブログサイトを構築しました。技術的な実装の詳細、SEO最適化、アクセシビリティ対応など、多くのことを学ぶことができました。

今後も、継続的に改善を重ねながら、より良いサイトにしていきたいと思います。
