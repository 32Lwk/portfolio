---
title: "TypeScriptで安全なコードを書くためのベストプラクティス"
description: "医療×AI分野での開発経験から学んだ、TypeScriptで安全なコードを書くための実践的なテクニックを紹介します。"
date: "2026-02-05"
category: "技術"
tags: ["TypeScript"]
author: "川嶋宥翔"
featured: false
---

# TypeScriptで安全なコードを書くためのベストプラクティス

医療情報システムの開発において、型安全性は極めて重要です。この記事では、実践的なTypeScriptのベストプラクティスを紹介します。

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

## まとめ

TypeScriptの型システムを最大限に活用することで、実行時エラーを減らし、保守性の高いコードを書くことができます。特に医療情報システムのような安全性が重要な分野では、型安全性は必須です。

「システムを誤らせない設計」を実現するため、型定義を丁寧に行い、コンパイラの力を借りることが重要です。
