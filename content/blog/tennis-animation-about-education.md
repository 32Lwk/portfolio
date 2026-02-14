---
title: "About ページの学歴セクションにテニスサーブアニメーションを追加しました"
description: "学歴（中高・大学）を表示する About ページに、Canvas で描画するテニスサーブのアニメーションを追加した話です。"
date: "2026-02-14"
category: "技術"
tags: ["Next.js", "Canvas", "アニメーション", "About"]
author: "川嶋宥翔"
slug: "tennis-animation-about-education"
featured: false
---

# About ページの学歴セクションにテニスサーブアニメーションを追加しました

ポートフォリオサイトの About ページでは、経歴を「学歴」と「キャリア」のタイムラインで表示しています。今回、**学歴セクション（中高・大学の部分）にだけ**、背景でテニスサーブが打たれる Canvas アニメーションを追加しました。

## なぜテニスか

中高時代にテニス部に所属していた経験を、視覚的に少しだけ伝えたいと考えました。スクロールに連動してサーブが打たれ、ボールがコートのサービスボックスへ飛んでいく演出にしています。

## アニメーション

学歴セクションを表示したときの様子です。右側にプレイヤー、左側にコートが表示され、スクロールに合わせてサーブが打たれます。

![学歴セクションのテニスサーブアニメーション](/images/tennis-serve-about.gif)

## 実装の詳細

### アーキテクチャ

アニメーションは **HTML5 Canvas API** と **TypeScript** で実装しています。React の `useRef` で Canvas 要素とアニメーション状態を管理し、`useEffect` でライフサイクルを制御しています。

```typescript
interface TennisAnimationState {
  phase: "idle" | "preparing" | "serving" | "ballFlying" | "complete";
  progress: number; // 0-1
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  racketAngle: number;
}
```

### スクロール連動のフェーズ管理

スクロール位置に応じて、アニメーションを **3つのフェーズ** に分割しています：

1. **準備（preparing）**: スクロール進行度 0% → 40%
2. **サーブ（serving）**: スクロール進行度 40% → 70%
3. **ボール飛行（ballFlying）**: スクロール進行度 70% → 100%

```typescript
// スクロール位置からアニメーションの進行度を計算
const updateScrollProgress = () => {
  const { educationTop, careerTop } = getSectionPositions();
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportCenter = scrollY + viewportHeight / 2;
  
  const animationStart = educationTop;
  const animationEnd = careerTop - viewportHeight * 0.3;
  const animationRange = animationEnd - animationStart;
  
  if (viewportCenter >= animationStart && viewportCenter < animationEnd) {
    const progressInRange = (viewportCenter - animationStart) / animationRange;
    const normalizedProgress = Math.min(1, Math.max(0, progressInRange));
    
    // 進行度に応じてフェーズを設定
    if (normalizedProgress < 0.4) {
      stateRef.current.phase = "preparing";
      stateRef.current.progress = normalizedProgress / 0.4;
    } else if (normalizedProgress < 0.7) {
      stateRef.current.phase = "serving";
      stateRef.current.progress = (normalizedProgress - 0.4) / 0.3;
    } else {
      stateRef.current.phase = "ballFlying";
      stateRef.current.progress = (normalizedProgress - 0.7) / 0.3;
    }
  }
};
```

**工夫点**: ビューポートの中心位置（`viewportCenter`）を使うことで、スクロールの途中でセクションに入った場合でも自然にアニメーションが開始されます。

### サービスボックス内への制限アルゴリズム

ボールのターゲット位置を、**上のサービスボックス内**に制限する処理を実装しています。

```typescript
const constrainTargetToServiceBox = (
  ballStartX: number,
  ballStartY: number,
  targetX: number,
  targetY: number
): { x: number; y: number } => {
  // ターゲット位置をローカル座標に変換
  const localTarget = worldToLocal(targetX, targetY);
  
  // 上のサービスボックスの範囲（ネットの向こう側、y > 0）
  const serviceBoxMinX = 0; // センターライン
  const serviceBoxMaxX = halfSinglesWidth;
  const serviceBoxMinY = serviceLineY; // サービスライン
  const serviceBoxMaxY = halfLength; // ベースライン
  
  // サービスボックス内に制限
  let constrainedX = Math.max(serviceBoxMinX, Math.min(serviceBoxMaxX, localTarget.x));
  let constrainedY = Math.max(serviceBoxMinY, Math.min(serviceBoxMaxY, localTarget.y));
  
  // 範囲外の場合は中央付近に配置
  if (localTarget.x < serviceBoxMinX || localTarget.x > serviceBoxMaxX) {
    constrainedX = (serviceBoxMinX + serviceBoxMaxX) / 2;
  }
  if (localTarget.y < serviceBoxMinY || localTarget.y > serviceBoxMaxY) {
    constrainedY = (serviceBoxMinY + serviceBoxMaxY) / 2;
  }
  
  return localToWorld(constrainedX, constrainedY);
};
```

**工夫点**: ローカル座標系で判定することで、コートが回転していても正確にサービスボックス内に制限できます。

### 物理演算による放物線軌道

ボールの軌道は **物理演算** で計算しています。初速度と重力を考慮した放物線運動です。

```typescript
// 放物線の係数（初速度と重力を考慮）
const vx0 = dx * 0.026; // 水平方向の初速度
const vy0 = dy * 0.023 - 5; // 垂直方向の初速度（上向きに）
const gravity = 0.37; // 重力

// サーブフェーズでの位置計算
const t = serveProgress; // 0-1
state.ballX = ballStartX + vx0 * t * 50;
state.ballY = ballStartY + vy0 * t * 50 + 0.5 * gravity * (t * 50) * (t * 50);

// ボール飛行フェーズでの物理演算
const ballTimeScale = 0.55; // 速度調整（軌道は変わらない）
state.ballX += state.ballVx * ballTimeScale;
state.ballY += state.ballVy * ballTimeScale;
state.ballVy += 0.3 * ballTimeScale; // 重力
```

**工夫点**: `ballTimeScale` で速度だけを調整することで、**軌道の形状を変えずに**アニメーション速度を制御できます。これにより、見た目の調整が容易になります。

### 画面外での停止処理

ボールが画面外に出た場合、速度を 0 にして停止させます。

```typescript
// 画面外に出たらボールを止める
const offScreenMargin = 50;
const bottomLimit = window.innerHeight * 1.05;
const isOffScreen =
  state.ballY > bottomLimit ||
  state.ballX < -offScreenMargin ||
  state.ballX > window.innerWidth + offScreenMargin;
  
if (isOffScreen) {
  state.ballVx = 0;
  state.ballVy = 0;
  // 位置を境界にクランプ
  state.ballX = Math.max(-offScreenMargin, Math.min(window.innerWidth + offScreenMargin, state.ballX));
  state.ballY = Math.min(bottomLimit, state.ballY);
}
```

### 硬式テニスボールの描画

ボールは **硬式テニスボール風** に描画しています。蛍光イエローグリーンと白い縫い目が特徴です。

```typescript
const drawTennisBall = (ctx: CanvasRenderingContext2D, cx: number, cy: number, ballSize: number) => {
  // 本体：蛍光イエローグリーン（オプティックイエロー）
  const gradient = ctx.createRadialGradient(
    cx - ballSize * 0.35,
    cy - ballSize * 0.35,
    0,
    cx, cy, ballSize
  );
  gradient.addColorStop(0, "#e8ff8a");
  gradient.addColorStop(0.5, "#d4f537");
  gradient.addColorStop(1, "#b8d430");
  ctx.fillStyle = gradient;
  ctx.arc(cx, cy, ballSize, 0, Math.PI * 2);
  ctx.fill();
  
  // 白い縫い目（ボール内にクリップ）
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, ballSize - 1, 0, Math.PI * 2);
  ctx.clip(); // ボールの円でクリップ
  ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
  ctx.lineWidth = Math.max(2.5, ballSize * 0.2);
  // 楕円の弧で縫い目を描画（上半分と下半分）
  ctx.ellipse(cx, cy, ballSize * 0.92, ballSize * 0.38, 0, 0, Math.PI);
  ctx.stroke();
  ctx.ellipse(cx, cy, ballSize * 0.92, ballSize * 0.38, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};
```

**工夫点**: `ctx.clip()` でボールの円内だけに描画することで、縫い目がボールからはみ出さないようにしています。

### ダークモード対応

コートの色とプレイヤーの色を、ダークモードに応じて動的に変更しています。

```typescript
const isDarkMode = () => {
  if (typeof document === "undefined") return true;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// コートの色をテーマに応じて変更
const courtLineStroke = dark
  ? "rgba(255, 255, 255, 0.95)"  // ダークモード: 白
  : "rgba(0, 0, 0, 0.88)";        // ライトモード: 黒

// プレイヤーの色も調整
const getPlayerColor = () => {
  const hue = getCSSVariable("--primary").split(" ")[0] || "200";
  const [s, l] = dark ? [70, 52] : [45, 35]; // ダーク: 明るめ、ライト: 暗め
  return `hsl(${hue}, ${s}%, ${l}%)`;
};
```

### 高DPI対応

Retina ディスプレイなど、高DPI環境でも鮮明に表示されるようにしています。

```typescript
const resizeCanvas = () => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
};
```

**工夫点**: Canvas の内部解像度を `devicePixelRatio` 倍にし、CSS サイズは元のままにすることで、高DPIでもぼやけずに描画できます。

### アクセシビリティ

`prefers-reduced-motion` が有効な場合は、アニメーションを表示しません。

```typescript
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

useEffect(() => {
  if (prefersReducedMotion()) {
    return; // アニメーションをスキップ
  }
  // ... アニメーション処理
}, []);
```

## パラメータ調整のポイント

以下の定数を調整することで、アニメーションの見た目を微調整できます：

- **サーブのタイミング**: `progress > 0.6` の値を変更（0.5 にすると早く、0.7 にすると遅く打つ）
- **ボールの速度**: `ballTimeScale = 0.55` を変更（小さいほど遅い）
- **コートのサイズ**: `* 1.25` の倍率を変更
- **物理パラメータ**: `vx0`, `vy0`, `gravity` の係数を調整

## まとめ

スクロール連動の Canvas アニメーションを実装することで、学歴セクションに動きと興味を持たせることができました。実寸比を意識したコート描画や、物理演算による自然なボール軌道など、細部にこだわった実装になっています。
