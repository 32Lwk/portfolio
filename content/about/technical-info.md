# 技術情報・実装詳細 - 川嶋宥翔

> 最終更新日: 2026年2月12日  
> コードベースから抽出した技術情報と実装詳細

---

## 🛠️ 技術スタック（実装済み）

### フロントエンド
- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.x
- **shadcn/ui**: UIコンポーネントライブラリ
- **framer-motion**: 12.34.0 - アニメーション
- **next-themes**: 0.4.6 - ダークモード対応
- **lucide-react**: 0.563.0 - アイコン

### バックエンド・API
- **OpenAI API**: 4.20.0 - AI機能（ビルド時生成）
- **DeepL API**: 多言語翻訳（プロジェクトで使用）

### コンテンツ管理
- **gray-matter**: 4.0.3 - Markdownフロントマター解析
- **next-mdx-remote**: 6.0.0 - MDXレンダリング
- **date-fns**: 4.1.0 - 日付フォーマット

### 開発ツール
- **TypeScript**: 型安全性
- **ESLint**: コード品質
- **tsx**: 4.7.0 - TypeScript実行環境

### デプロイ・インフラ
- **Vercel**: ホスティング（静的サイト）
- **GitHub**: ソースコード管理、CI/CD

---

## 📁 プロジェクト構造（実装済み）

```
portfolio-site/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト（メタデータ、テーマ）
│   ├── page.tsx                  # ホームページ
│   ├── globals.css               # グローバルスタイル
│   ├── about/
│   │   └── page.tsx              # Aboutページ
│   ├── resume/
│   │   └── page.tsx              # Resumeページ
│   ├── blog/
│   │   ├── page.tsx              # ブログ一覧
│   │   └── [slug]/
│   │       └── page.tsx          # ブログ記事詳細
│   ├── projects/
│   │   └── page.tsx              # プロジェクト一覧
│   ├── sitemap.ts                # サイトマップ生成
│   ├── robots.ts                 # robots.txt生成
│   ├── not-found.tsx             # 404ページ
│   ├── error.tsx                 # エラーページ
│   └── global-error.tsx          # グローバルエラーページ
│
├── components/
│   ├── ui/                       # shadcn/uiコンポーネント
│   │   ├── button.tsx
│   │   └── badge.tsx
│   ├── layout/                   # レイアウトコンポーネント
│   │   ├── Header.tsx            # ヘッダー（ナビゲーション、テーマ切り替え）
│   │   ├── Footer.tsx            # フッター（SNSリンク）
│   │   └── ThemeProvider.tsx     # テーマプロバイダー
│   ├── about/                    # Aboutページコンポーネント
│   │   ├── HeroSection.tsx
│   │   ├── BioSection.tsx
│   │   ├── EducationTimeline.tsx
│   │   ├── CareerTimeline.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ValuesSection.tsx
│   │   └── ContactSection.tsx
│   ├── portfolio/               # ポートフォリオコンポーネント
│   │   ├── ProjectCard.tsx       # プロジェクトカード（3Dホバー）
│   │   ├── ProjectGrid.tsx      # プロジェクトグリッド
│   │   └── ProjectImage.tsx      # プロジェクト画像（エラーハンドリング）
│   ├── blog/                     # ブログコンポーネント
│   │   ├── BlogCard.tsx
│   │   ├── BlogList.tsx
│   │   ├── BlogNavigation.tsx    # 前後の記事ナビゲーション
│   │   ├── ShareButtons.tsx      # SNSシェアボタン
│   │   ├── TableOfContents.tsx   # 目次（自動生成）
│   │   └── MdxComponents.tsx     # MDXカスタムコンポーネント
│   ├── resume/                   # Resumeコンポーネント
│   │   ├── ResumeSection.tsx
│   │   └── ResumeDownload.tsx
│   ├── animations/               # アニメーションコンポーネント
│   │   ├── ScrollReveal.tsx      # スクロール連動アニメーション
│   │   ├── ParticleBackground.tsx # パーティクル背景
│   │   ├── CursorFollower.tsx    # カーソル追従エフェクト
│   │   └── PageTransition.tsx    # ページ遷移アニメーション
│   └── seo/                      # SEOコンポーネント
│       └── StructuredData.tsx    # JSON-LD構造化データ
│
├── lib/                          # ユーティリティ関数
│   ├── utils.ts                  # 汎用ユーティリティ（cn関数）
│   ├── blog.ts                   # ブログ記事読み込み・解析
│   ├── projects.ts               # プロジェクトデータ管理
│   ├── skills.ts                 # スキルデータ管理
│   ├── resume.ts                 # Resumeデータ管理
│   ├── ai.ts                     # AI API呼び出し（ビルド時）
│   └── seo.ts                    # SEOメタデータ生成
│
├── content/                      # コンテンツファイル
│   ├── blog/                     # Markdownブログ記事
│   │   └── sample-post.md
│   ├── projects/                 # プロジェクトデータ
│   │   └── projects.json
│   └── about/                    # Aboutページデータ
│       ├── skills.json
│       ├── personal-info.md      # 個人情報まとめ
│       ├── data-inventory.md     # データインベントリ
│       └── technical-info.md     # 技術情報（このファイル）
│
├── public/                       # 静的ファイル
│   ├── images/
│   │   ├── projects/            # プロジェクト画像（準備中）
│   │   └── about/                # Aboutページ画像（準備中）
│   └── resume/
│       └── resume.pdf           # Resume PDF（準備中）
│
└── scripts/                      # ビルドスクリプト
    └── generate-metadata.ts      # AIメタデータ生成スクリプト
```

---

## 🎨 デザインシステム

### カラーパレット（CSS変数）

#### ライトモード
```css
--background: 0 0% 100%;
--foreground: 0 0% 3.9%;
--card: 0 0% 100%;
--card-foreground: 0 0% 3.9%;
--primary: 0 0% 9%;
--primary-foreground: 0 0% 98%;
--secondary: 0 0% 96.1%;
--secondary-foreground: 0 0% 9%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;
--accent: 0 0% 96.1%;
--accent-foreground: 0 0% 9%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--border: 0 0% 89.8%;
--input: 0 0% 89.8%;
--ring: 0 0% 3.9%;
--radius: 0.5rem;
```

#### ダークモード
```css
--background: 0 0% 3.9%;
--foreground: 0 0% 98%;
--card: 0 0% 3.9%;
--card-foreground: 0 0% 98%;
--primary: 0 0% 98%;
--primary-foreground: 0 0% 9%;
--secondary: 0 0% 14.9%;
--secondary-foreground: 0 0% 98%;
--muted: 0 0% 14.9%;
--muted-foreground: 0 0% 63.9%;
--accent: 0 0% 14.9%;
--accent-foreground: 0 0% 98%;
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 0 0% 98%;
--border: 0 0% 14.9%;
--input: 0 0% 14.9%;
--ring: 0 0% 83.1%;
```

### タイポグラフィ
- **フォント**: Inter (Google Fonts)
- **フォントサイズ**: Tailwind CSSのデフォルトスケール
- **行間**: 1.5-1.75（読みやすさ重視）

### アニメーション
- **ScrollReveal**: Intersection Observer API + framer-motion
- **3Dホバーエフェクト**: CSS transform + framer-motion
- **ページ遷移**: framer-motion
- **パーティクル背景**: Canvas API

---

## 🔧 実装済み機能

### SEO最適化
- ✅ メタデータ（title, description, keywords）
- ✅ OGPタグ（Open Graph）
- ✅ Twitter Card
- ✅ JSON-LD構造化データ（Person, Article, WebSite, Project）
- ✅ サイトマップ自動生成（sitemap.ts）
- ✅ robots.txt自動生成（robots.ts）

### パフォーマンス最適化
- ✅ Next.js Image最適化
- ✅ コード分割・動的インポート準備
- ✅ フォント最適化（next/font）
- ✅ 静的サイト生成（SSG）

### アクセシビリティ
- ✅ WCAG AA準拠を意識した実装
- ✅ キーボードナビゲーション対応
- ✅ スクリーンリーダー対応（aria-label等）
- ✅ セマンティックHTML

### エラーハンドリング
- ✅ カスタム404ページ
- ✅ エラーバウンダリ（error.tsx, global-error.tsx）
- ✅ 画像読み込みエラーハンドリング（ProjectImage.tsx）

### インタラクティブ機能
- ✅ スクロール連動アニメーション（ScrollReveal）
- ✅ 3Dホバーエフェクト（ProjectCard）
- ✅ パーティクル背景（ParticleBackground）
- ✅ カーソル追従エフェクト（CursorFollower）
- ✅ ページ遷移アニメーション（PageTransition）

---

## 📊 データ構造

### プロジェクトデータ（projects.json）
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

### スキルデータ（skills.json）
```typescript
interface Skill {
  category: "言語" | "フレームワーク" | "ツール" | "インフラ" | "その他";
  name: string;
  icon: string;
  level: "Advanced" | "Intermediate" | "Beginner";
  years: number;
  startDate: string; // YYYY-MM
  description?: string;
}
```

### ブログ記事（Markdown + Frontmatter）
```yaml
---
title: string
description: string
date: string (YYYY-MM-DD)
category: "技術" | "プロジェクト" | "学習" | "キャリア" | "日記"
tags: string[]
author: "川嶋宥翔"
slug: string
featured: boolean
---
```

### Resumeデータ（lib/resume.ts）
```typescript
interface ResumeData {
  personalInfo: {
    name: string;
    nameEn: string;
    title: string;
    email: string;
    github: string;
    linkedin: string;
  };
  education: Array<{
    period: string;
    institution: string;
    description: string;
  }>;
  career: Array<{
    period: string;
    title: string;
    description: string;
  }>;
  projects: Project[];
  skills: Skill[];
  certifications: string[];
  languages: Array<{
    name: string;
    level: string;
  }>;
}
```

---

## 🚀 デプロイ設定

### Vercel設定
- **フレームワーク**: Next.js
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `.next`
- **環境変数**: 
  - `OPENAI_API_KEY` - AI機能用
  - `NEXT_PUBLIC_SITE_URL` - サイトURL

### GitHub設定
- **リポジトリ**: （未設定）
- **ブランチ**: main
- **自動デプロイ**: Vercel連携

---

## 📝 スクリプト

### package.json scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "generate:metadata": "tsx scripts/generate-metadata.ts"
}
```

### AIメタデータ生成スクリプト
- **ファイル**: `scripts/generate-metadata.ts`
- **用途**: ビルド時にブログ記事のメタデータをAI生成
- **実行**: `npm run generate:metadata`
- **キャッシュ**: `.cache/`ディレクトリに保存

---

## 🔐 環境変数

### 必須環境変数
```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SITE_URL=https://www.yutok.dev
```

### オプション環境変数
```env
# 開発環境用
NODE_ENV=development

# 本番環境用
NODE_ENV=production
```

---

## 📦 依存関係の詳細

### 主要依存関係
- **next**: 16.1.6 - Reactフレームワーク
- **react**: 19.2.3 - UIライブラリ
- **react-dom**: 19.2.3 - React DOMレンダラー
- **typescript**: 5.x - 型システム
- **tailwindcss**: 4.x - CSSフレームワーク
- **framer-motion**: 12.34.0 - アニメーション
- **next-themes**: 0.4.6 - テーマ管理
- **gray-matter**: 4.0.3 - Markdown解析
- **next-mdx-remote**: 6.0.0 - MDXレンダリング
- **openai**: 4.20.0 - OpenAI API
- **date-fns**: 4.1.0 - 日付処理

### 開発依存関係
- **@types/node**: 20.x - Node.js型定義
- **@types/react**: 19.x - React型定義
- **@types/react-dom**: 19.x - React DOM型定義
- **eslint**: 9.x - リンター
- **eslint-config-next**: 16.1.6 - Next.js ESLint設定
- **tsx**: 4.7.0 - TypeScript実行環境

---

## 🎯 パフォーマンス目標

### Lighthouse目標スコア
- **Performance**: 90+（目標: 100）
- **Accessibility**: 90+（目標: 100）
- **Best Practices**: 90+（目標: 100）
- **SEO**: 90+（目標: 100）

### 最適化手法
- 静的サイト生成（SSG）
- 画像最適化（Next.js Image）
- コード分割
- フォント最適化
- 遅延読み込み

---

## 🔄 今後の拡張予定

### 機能拡張
- [ ] ブログ記事の追加（最低3-5記事）
- [ ] プロジェクト画像の追加
- [ ] Resume PDFの作成・アップロード
- [ ] 未踏事業採択後の情報追加
- [ ] GitHub API連携（コントリビューショングラフ）
- [ ] コメント機能（オプション）
- [ ] ニュースレター機能（オプション）

### 技術的改善
- [ ] パフォーマンス最適化の追加
- [ ] アクセシビリティの向上
- [ ] テストの追加（Jest, React Testing Library）
- [ ] E2Eテスト（Playwright）
- [ ] パフォーマンス監視（Vercel Analytics）

---

*このドキュメントは、実装済みの技術情報とコードベースの詳細を記録したものです。*
