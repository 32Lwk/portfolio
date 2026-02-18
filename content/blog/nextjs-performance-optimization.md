---
title: Next.js 16のパフォーマンス最適化テクニック
description: Next.js 16を使用したポートフォリオサイトのパフォーマンス最適化で実践したテクニックと実装の詳細を紹介します。
date: '2026-02-08'
category: 技術
tags:
  - Next.js
  - パフォーマンス
  - TypeScript
author: 川嶋宥翔
featured: false
hidden: false
---

# Next.js 16のパフォーマンス最適化テクニック

ポートフォリオサイトの構築において、パフォーマンス最適化は重要な要素です。この記事では、Next.js 16を使用した実践的な最適化テクニックと、実際の実装例を紹介します。

## プロジェクトの概要

このポートフォリオサイトは、Next.js 16.1.6 (App Router)、React 19.2.3、TypeScript 5.xを使用して構築されています。静的サイト生成（SSG）を活用し、Vercelにデプロイしています。

## 1. 画像の最適化

Next.jsの`Image`コンポーネントを活用することで、自動的な画像最適化が可能です。実際の実装では、エラーハンドリングも含めた`SafeImage`コンポーネントを作成しました。

### 実装例: SafeImageコンポーネント

```typescript
// components/portfolio/SafeImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  aspectRatio,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const containerClass = aspectRatio
      ? `relative w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ${aspectRatio}`
      : "h-48 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center";
    return (
      <div className={containerClass}>
        <span className="text-muted-foreground">画像準備中</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={85}
      onError={() => setHasError(true)}
      unoptimized={src.startsWith("http://") || src.startsWith("https://")}
    />
  );
}
```

### next.config.tsでの画像最適化設定

```typescript
// next.config.ts
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

### 最適化のポイント

- **適切なサイズ指定**: `sizes`プロパティでレスポンシブな画像サイズを指定
- **フォーマット最適化**: AVIF、WebP形式への自動変換
- **遅延読み込み**: ビューポート外の画像は自動的に遅延読み込み（`priority={false}`がデフォルト）
- **エラーハンドリング**: 画像読み込み失敗時のフォールバック表示
- **品質設定**: `quality={85}`でバランスの取れた画質とファイルサイズ

### 実装例: ProjectImageコンポーネント

```typescript
// components/portfolio/ProjectImage.tsx
export function ProjectImage({ src, alt }: ProjectImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">画像準備中</span>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-full overflow-hidden bg-muted group">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
        onError={() => setHasError(true)}
        unoptimized={src.startsWith("http://") || src.startsWith("https://")}
      />
    </div>
  );
}
```

## 2. フォントの最適化

Next.js 16の`next/font`を使用して、フォントの読み込みを最適化します。実際の実装では、Google FontsのInterフォントを使用しています。

### 実装例: app/layout.tsx

```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### 最適化のポイント

- **サブセット指定**: `subsets: ["latin"]`で必要な文字のみを読み込み
- **CSS変数**: `variable`プロパティでCSS変数として使用可能に
- **自動最適化**: Next.jsが自動的にフォントを最適化し、自己ホスト

## 3. 静的サイト生成（SSG）

すべてのページをビルド時に静的生成することで、高速な表示を実現しています。

### 実装例: ブログ記事ページ

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  // ...
}
```

### 最適化のポイント

- **ビルド時生成**: すべてのページをビルド時に生成
- **動的ルーティング**: `generateStaticParams`で動的ルートのパラメータを事前生成
- **高速な表示**: サーバーサイドレンダリング不要で、即座に表示

## 4. メタデータとSEO

適切なメタデータの設定は、SEOだけでなくパフォーマンスにも影響します。実際の実装では、ルートレイアウトでメタデータを設定しています。

### 実装例: app/layout.tsx

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "川嶋 宥翔 | Portfolio & Blog",
    template: "%s | 川嶋 宥翔",
  },
  description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
  keywords: ["ポートフォリオ", "ブログ", "フルスタックエンジニア", "医療AI", "Next.js", "TypeScript"],
  authors: [{ name: "川嶋 宥翔", url: "https://github.com/32Lwk" }],
  creator: "川嶋 宥翔",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://www.yutok.dev",
    title: "川嶋 宥翔 | Portfolio & Blog",
    description: "...",
    siteName: "川嶋 宥翔 | Portfolio & Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "川嶋 宥翔 | Portfolio & Blog",
    description: "...",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### 最適化のポイント

- **タイトルテンプレート**: `template`プロパティで一貫したタイトル形式
- **OGPタグ**: Open Graph ProtocolによるSNS共有対応
- **Twitter Card**: Twitterでの共有時の最適化
- **robots設定**: 検索エンジン向けの適切な設定

## 5. スクリプトの最適化

テーマ切り替えのスクリプトを`beforeInteractive`戦略で読み込むことで、FOUC（Flash of Unstyled Content）を防止しています。

### 実装例: app/layout.tsx

```typescript
// app/layout.tsx
<Script
  id="theme-init"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{
    __html: `(function(){var t=localStorage.getItem('theme');var s=!t||t==='system';var d=s?window.matchMedia('(prefers-color-scheme: dark)').matches:t==='dark';document.documentElement.classList.toggle('dark',d);})();`,
  }}
/>
```

### 最適化のポイント

- **beforeInteractive**: ページがインタラクティブになる前に実行
- **FOUC防止**: テーマ切り替えのフラッシュを防止
- **インラインスクリプト**: 小さなスクリプトはインラインで記述

## 6. サイトマップとrobots.txtの自動生成

動的にサイトマップとrobots.txtを生成することで、SEOを最適化しています。

### 実装例: app/sitemap.ts

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yutok.dev";
  const posts = getAllPosts();
  const projects = getAllProjects();

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...postUrls,
    ...projectUrls,
  ];
}
```

## パフォーマンス指標

最適化の結果、以下の指標を達成しました：

- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 200ms（静的サイト生成により）

## 学びと課題

### 学んだこと

1. **画像最適化の重要性**: 適切な画像最適化により、ページの読み込み速度が大幅に向上しました。

2. **静的サイト生成の効果**: SSGにより、サーバーサイドレンダリング不要で高速な表示を実現できました。

3. **フォント最適化**: `next/font`を使用することで、フォントの読み込みが最適化され、FOUT（Flash of Unstyled Text）を防止できました。

4. **メタデータの設定**: 適切なメタデータの設定により、SEOとSNS共有が改善されました。

### 今後の改善予定

1. **コード分割の強化**: 大きなコンポーネントを動的インポートで分割し、初期バンドルサイズを削減する予定です。

2. **パフォーマンス監視**: Lighthouse CIなどを導入し、継続的にパフォーマンスを監視する予定です。

3. **画像の最適化**: より適切な`srcset`の設定や、画像の遅延読み込みの最適化を検討しています。

## まとめ

Next.js 16の機能を最大限に活用することで、優れたパフォーマンスを実現できます。特に、画像最適化、静的サイト生成、フォント最適化は効果が大きいので、優先的に実装することをおすすめします。

今後も、継続的にパフォーマンスを監視し、改善を重ねていきたいと思います。
