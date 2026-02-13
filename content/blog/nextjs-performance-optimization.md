---
title: "Next.js 15のパフォーマンス最適化テクニック"
description: "Next.js 15を使用したポートフォリオサイトのパフォーマンス最適化で実践したテクニックを紹介します。"
date: "2026-02-08"
category: "技術"
tags: ["Next.js", "パフォーマンス"]
author: "川嶋宥翔"
featured: false
---

# Next.js 15のパフォーマンス最適化テクニック

ポートフォリオサイトの構築において、パフォーマンス最適化は重要な要素です。この記事では、Next.js 15を使用した実践的な最適化テクニックを紹介します。

## 1. 画像の最適化

Next.jsの`Image`コンポーネントを活用することで、自動的な画像最適化が可能です。

```typescript
import Image from 'next/image';

<Image
  src="/images/project.jpg"
  alt="プロジェクト画像"
  width={800}
  height={600}
  priority={false} // フォールド上の画像のみtrue
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### 最適化のポイント

- **適切なサイズ指定**: 実際に表示されるサイズに合わせる
- **フォーマット最適化**: WebP形式への自動変換
- **遅延読み込み**: ビューポート外の画像は自動的に遅延読み込み

## 2. コード分割と動的インポート

大きなライブラリやコンポーネントは動的インポートを使用します。

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>読み込み中...</p>,
  ssr: false // クライアント側のみでレンダリング
});
```

## 3. フォントの最適化

Next.js 15の`next/font`を使用して、フォントの読み込みを最適化します。

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
```

## 4. メタデータとSEO

適切なメタデータの設定は、SEOだけでなくパフォーマンスにも影響します。

```typescript
export const metadata: Metadata = {
  title: 'ページタイトル',
  description: 'ページの説明',
  openGraph: {
    title: 'OGタイトル',
    description: 'OG説明',
    images: ['/og-image.jpg'],
  },
};
```

## 5. キャッシング戦略

APIルートやデータフェッチングで適切なキャッシングを設定します。

```typescript
export async function GET() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // 1時間キャッシュ
  });
  
  return Response.json(data);
}
```

## パフォーマンス指標

最適化の結果、以下の指標を達成しました：

- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## まとめ

Next.js 15の機能を最大限に活用することで、優れたパフォーマンスを実現できます。特に、画像最適化とコード分割は効果が大きいので、優先的に実装することをおすすめします。
