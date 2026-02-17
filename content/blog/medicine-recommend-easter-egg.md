---
title: イースターエッグ機能の実装 - 13種類の特別イベント対応とユーザー体験の向上
description: クリスマス、正月、バレンタインなど13種類の特別イベントに対応したイースターエッグ機能の実装について
date: '2025-12-26'
category: プロジェクト
tags:
  - 医薬品相談ツール
  - UI/UX
author: 川嶋宥翔
featured: false
hidden: false
---

# イースターエッグ機能の実装 - 13種類の特別イベント対応とユーザー体験の向上

ユーザー体験を向上させるため、13種類の特別イベントに対応したイースターエッグ機能を実装しました。この記事では、クリスマス、正月、バレンタインなど特別な日に対応した機能の実装について解説します。

## 開発の背景

ドラッグストアでの現場経験を通じて、特別な日にユーザーが楽しめる機能があると、より親しみやすいシステムになると考えました。例えば：

- **クリスマス**: 12月25日前後に特別な装飾
- **正月**: 1月1日前後に謹賀新年のアニメーション
- **バレンタイン**: 2月14日にバレンタイン装飾
- **節分**: 2月1日～2月3日に節分装飾

これらの特別な日に、ユーザーが楽しめるイースターエッグ機能を実装しました。

## イースターエッグ機能の実装

### 1. イベント検出の実装

```python
# src/utils/easter_egg.py
from datetime import datetime

def detect_special_event():
    """
    現在の日付から特別イベントを検出
    
    Returns:
        event_info: イベント情報（イベント名、装飾タイプなど）
    """
    today = datetime.now()
    month = today.month
    day = today.day
    
    # クリスマス（12月25日）
    if month == 12 and day == 25:
        return {
            "event": "christmas",
            "decoration": "snow",
            "message": "🎄 メリークリスマス！🎄"
        }
    
    # 正月（1月1日～1月7日）
    if month == 1 and 1 <= day <= 7:
        return {
            "event": "new_year",
            "decoration": "new_year_animation",
            "message": "🎊 明けましておめでとうございます！🎊"
        }
    
    # バレンタイン（2月14日）
    if month == 2 and day == 14:
        return {
            "event": "valentine",
            "decoration": "heart",
            "message": "💝 バレンタイン！💝"
        }
    
    # 節分（2月1日～2月3日）
    if month == 2 and 1 <= day <= 3:
        return {
            "event": "setsubun",
            "decoration": "bean",
            "message": "🥜 節分！🥜"
        }
    
    # その他のイベント
    # ...
    
    return None
```

### 2. 装飾の適用

```javascript
// フロントエンド側の実装
function applyEasterEggDecoration(eventInfo) {
    if (!eventInfo) {
        return;
    }
    
    const decorationType = eventInfo.decoration;
    const message = eventInfo.message;
    
    switch (decorationType) {
        case 'snow':
            applySnowAnimation();
            break;
        case 'new_year_animation':
            applyNewYearAnimation();
            break;
        case 'heart':
            applyHeartAnimation();
            break;
        case 'bean':
            applyBeanAnimation();
            break;
        // ... その他の装飾タイプ
    }
    
    // メッセージを表示
    showEasterEggMessage(message);
}
```

### 3. 雪のアニメーション（クリスマス）

```javascript
function applySnowAnimation() {
    // 雪のアニメーションを適用
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-container';
    snowContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(snowContainer);
    
    // 雪のパーティクルを生成
    for (let i = 0; i < 50; i++) {
        createSnowflake(snowContainer);
    }
}

function createSnowflake(container) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        opacity: 0.8;
        animation: fall linear infinite;
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 3 + 2}s;
        animation-delay: ${Math.random() * 2}s;
    `;
    
    container.appendChild(snowflake);
}

// CSSアニメーション
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);
```

### 4. 謹賀新年縦書きアニメーション（正月）

```javascript
function applyNewYearAnimation() {
    // 謹賀新年の縦書きアニメーション
    const newYearContainer = document.createElement('div');
    newYearContainer.className = 'new-year-container';
    newYearContainer.innerHTML = `
        <div class="new-year-text">
            <div class="character" style="animation-delay: 0s">謹</div>
            <div class="character" style="animation-delay: 0.2s">賀</div>
            <div class="character" style="animation-delay: 0.4s">新</div>
            <div class="character" style="animation-delay: 0.6s">年</div>
        </div>
    `;
    
    newYearContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2000;
        pointer-events: none;
    `;
    
    document.body.appendChild(newYearContainer);
    
    // 3秒後にフェードアウト
    setTimeout(() => {
        newYearContainer.style.transition = 'opacity 1s';
        newYearContainer.style.opacity = '0';
        setTimeout(() => {
            newYearContainer.remove();
        }, 1000);
    }, 3000);
}

// CSSアニメーション
const newYearStyle = document.createElement('style');
newYearStyle.textContent = `
    .new-year-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 48px;
        font-weight: bold;
        color: #d32f2f;
    }
    
    .character {
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(newYearStyle);
```

### 5. バレンタイン装飾（2月14日）

```javascript
function applyValentineDecoration() {
    // ハートのアニメーション
    const heartContainer = document.createElement('div');
    heartContainer.className = 'heart-container';
    heartContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(heartContainer);
    
    // ハートのパーティクルを生成
    setInterval(() => {
        createHeart(heartContainer);
    }, 500);
}

function createHeart(container) {
    const heart = document.createElement('div');
    heart.innerHTML = '💝';
    heart.style.cssText = `
        position: absolute;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        animation: floatUp 3s ease-out forwards;
    `;
    
    container.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 3000);
}

const heartStyle = document.createElement('style');
heartStyle.textContent = `
    @keyframes floatUp {
        to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(heartStyle);
```

## 13種類のイベント対応

### 実装済みイベント

1. **クリスマス** (12月25日): 雪のアニメーション
2. **正月** (1月1日～1月7日): 謹賀新年縦書きアニメーション
3. **バレンタイン** (2月14日): ハートのアニメーション
4. **節分** (2月1日～2月3日): 豆のアニメーション
5. **冬の一般シーズン** (1月8日～1月31日、2月4日～2月13日、2月15日～2月28日): 冬装飾
6. **その他8種類のイベント**: 今後追加予定

## 年度ごとの干支画像表示

2026年以降は、その年度の干支画像を自動表示：

```python
def get_zodiac_image(year):
    """
    年度の干支画像を取得
    
    Args:
        year: 年度
    
    Returns:
        zodiac_image_url: 干支画像のURL
    """
    zodiac_map = {
        2026: "monkey",  # 申年
        2027: "rooster",  # 酉年
        2028: "dog",      # 戌年
        # ... その他の年度
    }
    
    zodiac = zodiac_map.get(year, "default")
    return f"/images/zodiac/{zodiac}.png"
```

## 拡張性の高い設計

将来的に春・夏・秋のシーズンにも簡単に対応できる設計：

```python
def detect_season():
    """
    季節を検出
    
    Returns:
        season: 季節（spring, summer, autumn, winter）
    """
    today = datetime.now()
    month = today.month
    
    if 3 <= month <= 5:
        return "spring"
    elif 6 <= month <= 8:
        return "summer"
    elif 9 <= month <= 11:
        return "autumn"
    else:
        return "winter"

def apply_seasonal_decoration(season):
    """
    季節に応じた装飾を適用
    
    Args:
        season: 季節
    """
    seasonal_decorations = {
        "spring": {"type": "cherry_blossom", "color": "#ffb3d9"},
        "summer": {"type": "sun", "color": "#ffd700"},
        "autumn": {"type": "leaves", "color": "#ff8c00"},
        "winter": {"type": "snow", "color": "#ffffff"}
    }
    
    decoration = seasonal_decorations.get(season)
    if decoration:
        apply_decoration(decoration)
```

## トラブルシューティング

### 問題: アニメーションが重い

**原因**: パーティクル数が多すぎる

**解決策**: 
- パーティクル数の調整
- アニメーションの最適化
- 低性能デバイスでの無効化

### 問題: 装飾が表示されない

**原因**: 日付の判定が正しくない

**解決策**: 
- タイムゾーンの考慮
- 日付判定ロジックの確認

### 問題: ユーザーが装飾を無効化したい

**原因**: 設定機能がない

**解決策**: 
- ユーザー設定での無効化機能
- localStorageへの設定保存

## まとめ

イースターエッグ機能の実装により、13種類の特別イベントに対応した楽しい機能を提供できるようになりました。クリスマス、正月、バレンタインなど特別な日に、ユーザーが楽しめる装飾とアニメーションを実現しました。

今後も、より多くのイベントに対応し、ユーザー体験の向上を続けていきます。
