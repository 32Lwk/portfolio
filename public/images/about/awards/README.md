# 大会・賞歴セクション用画像

このフォルダに画像を配置し、`content/about/awards.json` で各大会に `image` と `memories` を設定すると、モーダルで表示されます。

## 設定例

```json
{
  "period": "2025年8月19日",
  "title": "AWS デジタル社会実現ツアー 2025 名古屋",
  "image": "/images/about/awards/aws-digital-society-2025.jpg",
  "memories": [
    {
      "text": "会場の様子や発表の感想を記載"
    },
    {
      "image": "/images/about/awards/aws-presentation.jpg",
      "imageAlt": "発表の様子",
      "text": "写真付きの感想"
    }
  ]
}
```
