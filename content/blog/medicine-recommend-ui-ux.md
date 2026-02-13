---
title: "UI/UX改善の軌跡 - 高齢者向けアクセシビリティと多言語対応"
description: "WCAG AA準拠のアクセシビリティ機能、音声読み上げ、文字サイズ調整、多言語対応など、すべてのユーザーが使いやすいUI/UXの実装について"
date: "2026-01-16"
category: "プロジェクト"
tags: ["医薬品相談ツール", "UI/UX", "アクセシビリティ"]
author: "川嶋宥翔"
featured: false
---

# UI/UX改善の軌跡 - 高齢者向けアクセシビリティと多言語対応

高齢者を含むすべてのユーザーが使いやすいシステムを目指し、包括的なアクセシビリティ機能と多言語対応を実装しました。この記事では、WCAG AA準拠の実装と、音声読み上げ・文字サイズ調整などの機能について解説します。

## アクセシビリティ機能の概要

### 実装した機能

1. **セクション折りたたみ機能**: 情報の優先順位を明確化
2. **音声読み上げ機能**: Web Speech APIを使用した全文読み上げ
3. **文字サイズ調整機能**: 4段階の文字サイズ調整（小・標準・大・特大）
4. **視覚的階層の改善**: 見出しサイズの拡大、行間と余白の拡大
5. **キーボード操作対応**: Tab順序の最適化、Enter/Spaceキーでの操作
6. **UDフォント対応**: ユニバーサルデザインフォントの優先使用

## セクション折りたたみ機能

推奨結果の各セクションを折りたたみ可能にし、情報の優先順位を明確化：

```javascript
// セクション折りたたみ機能の実装例
function CollapsibleSection({ title, children, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="collapsible-section">
      <button
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`section-${title}`}
      >
        <span>{title}</span>
        <span className="icon">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div id={`section-${title}`} className="section-content">
          {children}
        </div>
      )}
    </div>
  );
}
```

### 重要な情報の優先表示

- **デフォルトで展開**: 個別アドバイス、推奨医薬品
- **折りたたみ可能**: 曖昧入力警告、詳細症状分析

## 音声読み上げ機能

Web Speech APIを使用した全文読み上げ機能を実装：

```javascript
// 音声読み上げ機能の実装
function TextToSpeech({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1.0);
  
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  
  useEffect(() => {
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    utterance.onboundary = (event) => {
      const progressPercent = (event.charIndex / text.length) * 100;
      setProgress(progressPercent);
    };
    
    return () => {
      synth.cancel();
    };
  }, [text, rate]);
  
  const handlePlay = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      synth.speak(utterance);
      setIsPlaying(true);
    }
  };
  
  return (
    <div className="text-to-speech">
      <button onClick={handlePlay} aria-label="音声読み上げ">
        {isPlaying ? '⏸ 停止' : '▶ 再生'}
      </button>
      {isPlaying && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <label>
        速度:
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
}
```

### 機能の特徴

- **再生/停止のトグル機能**: 簡単に操作可能
- **進行状況表示**: プログレスバーとパーセンテージ
- **読み上げ速度の調整**: 0.5倍速から2.0倍速まで

## 文字サイズ調整機能

4段階の文字サイズ調整を実装：

```javascript
// 文字サイズ調整機能の実装
function FontSizeController() {
  const [fontSize, setFontSize] = useState('standard');
  
  const fontSizes = {
    small: { base: '14px', scale: 0.875 },
    standard: { base: '16px', scale: 1.0 },
    large: { base: '18px', scale: 1.125 },
    extraLarge: { base: '20px', scale: 1.5 }
  };
  
  useEffect(() => {
    const currentSize = fontSizes[fontSize];
    document.documentElement.style.setProperty('--base-font-size', currentSize.base);
    document.documentElement.style.setProperty('--font-scale', currentSize.scale);
    
    // localStorageに保存
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);
  
  return (
    <div className="font-size-controller">
      <label>文字サイズ:</label>
      <div className="font-size-buttons">
        {Object.keys(fontSizes).map(size => (
          <button
            key={size}
            onClick={() => setFontSize(size)}
            className={fontSize === size ? 'active' : ''}
            aria-label={`文字サイズ: ${size}`}
          >
            {size === 'small' && '小'}
            {size === 'standard' && '標準'}
            {size === 'large' && '大'}
            {size === 'extraLarge' && '特大'}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### CSS変数による動的制御

```css
:root {
  --base-font-size: 16px;
  --font-scale: 1.0;
}

body {
  font-size: var(--base-font-size);
  line-height: calc(1.8 * var(--font-scale));
}

h4 {
  font-size: calc(20px * var(--font-scale));
}

h5 {
  font-size: calc(18px * var(--font-scale));
}

/* paddingとmarginも自動スケーリング */
.content {
  padding: calc(1rem * var(--font-scale));
  margin: calc(1.5rem * var(--font-scale));
}
```

## 視覚的階層の改善

### 見出しサイズの拡大

```css
h4 {
  font-size: 20px;
  font-weight: bold;
  margin: 30px 0 15px 0;
}

h5 {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 10px 0;
}
```

### 行間と余白の拡大

```css
p {
  line-height: 1.8;
  margin: 15px 0;
}

.section {
  margin: 30px 0;
  padding: 20px;
}
```

### 警告の色分け

```css
.warning-danger {
  color: #d32f2f; /* 赤 */
  background-color: #ffebee;
  border-left: 4px solid #d32f2f;
}

.warning-caution {
  color: #f57c00; /* オレンジ */
  background-color: #fff3e0;
  border-left: 4px solid #f57c00;
}

.warning-info {
  color: #1976d2; /* 青 */
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}
```

## キーボード操作対応

### Tab順序の最適化

```html
<!-- 適切なTab順序 -->
<button tabindex="1">音声読み上げ</button>
<button tabindex="2">文字サイズ調整</button>
<button tabindex="3">セクション折りたたみ</button>
```

### フォーカスリングの強化

```css
button:focus {
  outline: 3px solid #1976d2;
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible {
  outline: 3px solid #1976d2;
  outline-offset: 2px;
}
```

### Enter/Spaceキーでの操作

```javascript
function handleKeyDown(event, onClick) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
}

<button
  onClick={handleToggle}
  onKeyDown={(e) => handleKeyDown(e, handleToggle)}
  aria-expanded={isExpanded}
>
  セクションを開く
</button>
```

## UDフォント対応

ユニバーサルデザインフォントを優先使用：

```css
body {
  font-family: 
    'BIZ UDPGothic',
    'Hiragino Kaku Gothic ProN',
    'Yu Gothic',
    'Meiryo',
    'MS PGothic',
    sans-serif;
}
```

## 多言語対応

### DeepL APIを使用した高速翻訳

```python
# src/services/translation.py
import deepl

def translate_text(text, target_language):
    """
    DeepL APIを使用して翻訳（10-20倍高速化）
    """
    translator = deepl.Translator(os.getenv('DEEPL_API_KEY'))
    
    language_map = {
        'en': 'EN',
        'zh': 'ZH',
        'ko': 'KO',
        'ja': 'JA'
    }
    
    target_lang = language_map.get(target_language, 'EN')
    
    try:
        result = translator.translate_text(text, target_lang=target_lang)
        return result.text
    except Exception as e:
        logger.error(f"DeepL翻訳エラー: {e}")
        return text
```

### 対応言語

- **日本語**: デフォルト言語
- **英語**: English
- **中国語**: 中文
- **韓国語**: 한국어

## WCAG AA準拠

### コントラスト比の確保

すべての色のコントラスト比を4.5:1以上に確保：

```css
/* テキストと背景のコントラスト比4.5:1以上 */
.text-primary {
  color: #1976d2; /* コントラスト比: 4.5:1 */
  background-color: #ffffff;
}

.text-secondary {
  color: #424242; /* コントラスト比: 7:1 */
  background-color: #ffffff;
}
```

### ARIA属性の適切な使用

```html
<button
  aria-label="音声読み上げを開始"
  aria-expanded={isPlaying}
  aria-controls="speech-content"
>
  音声読み上げ
</button>

<div
  id="speech-content"
  role="region"
  aria-live="polite"
>
  {text}
</div>
```

### タッチターゲットサイズ

44px×44px以上のタッチターゲットサイズを確保：

```css
button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}
```

## トラブルシューティング

### 問題: 音声読み上げが動作しない

**原因**: ブラウザがWeb Speech APIをサポートしていない

**解決策**: 
- ブラウザの互換性チェック
- フォールバック機能の実装（テキスト表示）

### 問題: 文字サイズ調整が反映されない

**原因**: CSS変数が正しく設定されていない

**解決策**: 
- `:root`セレクタでのCSS変数定義
- JavaScriptでの動的な設定確認

### 問題: キーボード操作ができない

**原因**: `tabindex`属性が適切に設定されていない

**解決策**: 
- 適切な`tabindex`値の設定
- フォーカス可能要素の確認

## まとめ

アクセシビリティ機能と多言語対応の実装により、高齢者を含むすべてのユーザーが使いやすいシステムを実現しました。WCAG AA準拠の実装により、スクリーンリーダーやキーボード操作にも対応しています。

今後も、WCAG AAA準拠を目指し、より包括的なアクセシビリティ機能の実装を続けていきます。
