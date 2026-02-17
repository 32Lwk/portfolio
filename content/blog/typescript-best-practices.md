---
title: TypeScriptで安全なコードを書くためのベストプラクティス
description: 医療×AI分野での開発経験から学んだ、TypeScriptで安全なコードを書くための実践的なテクニックを紹介します。
date: '2026-02-05'
category: 技術
tags:
  - TypeScript
  - 医療AI
  - 型安全性
author: 川嶋宥翔
featured: false
hidden: false
---

# TypeScriptで安全なコードを書くためのベストプラクティス

医療情報システムの開発において、型安全性は極めて重要です。チャット型医薬品相談ツール（[medicine-recommend-system](https://github.com/32Lwk/medicine-recommend-system)）ではバックエンドをPythonで実装していますが、ポートフォリオサイトや管理画面ではTypeScriptを採用しています。この記事では、**「システムを誤らせない設計」**を実現するための、実践的なTypeScriptのベストプラクティスを紹介します。

## 1. 厳格な型定義

### ユニオン型の活用

```typescript
// ❌ 悪い例
function processStatus(status: string) {
  // statusが想定外の値になる可能性がある
}

// ✅ 良い例
type Status = 'pending' | 'approved' | 'rejected';

function processStatus(status: Status) {
  // statusは必ず定義された値のいずれか
}
```

### リテラル型の使用

```typescript
// 定数として定義し、型安全性を確保
const CATEGORIES = ['技術記事', 'キャリア', '学習記録', '医療×IT'] as const;
type Category = typeof CATEGORIES[number];
```

## 2. 型ガードの活用

実行時の型チェックを確実に行います。

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    // ここではvalueはstring型として扱える
    console.log(value.toUpperCase());
  }
}
```

## 3. エラーハンドリング

### Result型パターン

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function fetchData(): Result<string> {
  try {
    const data = getData();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## 4. 厳密なnullチェック

```typescript
// tsconfig.jsonで設定
{
  "compilerOptions": {
    "strictNullChecks": true,
    "strict": true
  }
}
```

## 5. 型の再利用と抽象化

```typescript
// 共通の型定義を抽出
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogPost extends BaseEntity {
  title: string;
  content: string;
}

interface Project extends BaseEntity {
  name: string;
  description: string;
}
```

## 6. ジェネリクスの活用

```typescript
function createRepository<T extends BaseEntity>() {
  return {
    findById: (id: string): T | null => {
      // 実装
    },
    save: (entity: T): T => {
      // 実装
    },
  };
}
```

## 医療情報システムでの実践例

医療データの扱いでは、特に型安全性が重要です。

```typescript
// 症状の型定義
type SymptomSeverity = 1 | 2 | 3 | 4 | 5;

interface Symptom {
  name: string;
  severity: SymptomSeverity;
  duration: number; // 日数
  notes?: string;
}

// 型安全なバリデーション
function validateSymptom(symptom: unknown): symptom is Symptom {
  return (
    typeof symptom === 'object' &&
    symptom !== null &&
    'name' in symptom &&
    'severity' in symptom &&
    typeof symptom.severity === 'number' &&
    symptom.severity >= 1 &&
    symptom.severity <= 5
  );
}
```

## ポートフォリオサイトでの実践例

このブログをホストしているポートフォリオサイトでは、プロジェクトデータやブログ記事の型を明示的に定義しています。

### プロジェクト型定義（lib/projects.ts）

```typescript
export interface Project {
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

`category`をリテラル型のユニオンにすることで、存在しないカテゴリを代入するミスをコンパイル時に防いでいます。

### ブログ記事のフロントマター型

```typescript
export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
  slug?: string;
  featured?: boolean;
  hidden?: boolean;
}
```

## 医療・相談システムとの設計思想の共通点

medicine-recommend-system では、**絶対ブロック・リスクスコア・診断名検出**など多層防御を実装しています。TypeScript側でも同様に、**想定外の値を型で排除する**ことで、ランタイムの防御層を増やしています。

- **入力の正規化**: 外部入力（APIレスポンス、フォーム）は `unknown` で受け、型ガードで絞り込んでから利用する
- **定数の as const**: カテゴリ・ステータスなどは `as const` でリテラル型にし、typo や追加忘れを防ぐ
- **Optional の明示**: `?` や `undefined` を型に含めることで、未設定時のハンドリングを強制する

## まとめ

TypeScriptの型システムを最大限に活用することで、実行時エラーを減らし、保守性の高いコードを書くことができます。特に医療情報システムのような安全性が重要な分野では、型安全性は必須です。

「システムを誤らせない設計」を実現するため、型定義を丁寧に行い、コンパイラの力を借りることが重要です。バックエンド（Python）ではルールベースとLLMのハイブリッドで安全性を担保し、フロントエンド（TypeScript）では型で不整合を防ぐ——両輪で信頼できるシステムを目指しています。
