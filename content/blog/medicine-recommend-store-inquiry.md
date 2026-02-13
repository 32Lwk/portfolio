---
title: "店舗案内機能の実装 - 2,362件の商品データベースに対応した店舗案内システム"
description: "ドラッグストアでのスマートフォン利用を想定した店舗案内機能、商品検出機能、階層的カテゴリ分類の実装について"
date: "2025-12-29"
category: "プロジェクト"
tags: ["医薬品相談ツール"]
author: "川嶋宥翔"
featured: false
---

# 店舗案内機能の実装 - 2,362件の商品データベースに対応した店舗案内システム

ドラッグストアでのスマートフォン利用を想定した店舗案内機能を実装しました。この記事では、2,362件の商品データベースに対応した商品検出機能と階層的カテゴリ分類の実装について解説します。

## 開発の背景

ドラッグストアでの現場経験を通じて、以下のような店舗関連の質問が頻繁にあることを実感しました：

- 「歯ブラシはどこですか？」
- 「化粧水の在庫はありますか？」
- 「トイレはどこですか？」
- 「遺失物を探しています」

これらの質問に対応するため、包括的な店舗案内機能を実装しました。

## 商品データベースの構築

### 1. 階層的カテゴリ構造

```
ビューティ・トイレタリー
├── シャンプー・コンディショナー
│   ├── 商品名: メリット、パンテーン、...
│   └── ブランド名: シャンプー、コンディショナー、...
├── ボディケア
│   ├── 商品名: ボディソープ、ボディクリーム、...
│   └── ブランド名: ドーブ、ニベア、...
└── ...

医療・介護
├── 医療用品
│   ├── 商品名: マスク、体温計、...
│   └── ブランド名: 不織布マスク、...
└── ...
```

### 2. データ構造

```json
{
  "categories": {
    "ビューティ・トイレタリー": {
      "subcategories": {
        "シャンプー・コンディショナー": {
          "products": ["メリット", "パンテーン", "..."],
          "brands": ["シャンプー", "コンディショナー", "..."]
        }
      }
    }
  }
}
```

## 商品検出機能の実装

### 1. 商品名・ブランド名の自動検出

```python
# src/services/store_inquiry_handler.py
def classify_product_category(user_text):
    """
    ユーザー入力から商品名やブランド名を自動検出
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        product_info: 商品情報（カテゴリ、サブカテゴリ、商品名/ブランド名）
    """
    # 商品データベースを読み込み
    store_products = load_store_products()
    
    detected_products = []
    
    # 各カテゴリをチェック
    for category_name, category_data in store_products['categories'].items():
        for subcategory_name, subcategory_data in category_data['subcategories'].items():
            # 商品名の検出
            for product_name in subcategory_data.get('products', []):
                if product_name.lower() in user_text.lower():
                    detected_products.append({
                        'category': category_name,
                        'subcategory': subcategory_name,
                        'product_name': product_name,
                        'type': 'product'
                    })
            
            # ブランド名の検出
            for brand_name in subcategory_data.get('brands', []):
                if brand_name.lower() in user_text.lower():
                    detected_products.append({
                        'category': category_name,
                        'subcategory': subcategory_name,
                        'brand_name': brand_name,
                        'type': 'brand'
                    })
    
    return detected_products
```

### 2. 在庫確認機能の改善

```python
def handle_inventory_inquiry(user_text, detected_products):
    """
    在庫確認の処理
    
    Args:
        user_text: ユーザーの入力テキスト
        detected_products: 検出された商品情報
    
    Returns:
        response: 在庫確認応答
    """
    # 在庫確認キーワード
    inventory_keywords = ["在庫", "ありますか", "どこ", "場所は"]
    
    has_inventory_keyword = any(keyword in user_text for keyword in inventory_keywords)
    
    if has_inventory_keyword and detected_products:
        # 商品が検出された場合、カテゴリ情報を表示
        product_info = detected_products[0]
        category_path = f"{product_info['category']} > {product_info['subcategory']}"
        
        if product_info['type'] == 'product':
            product_name = product_info['product_name']
        else:
            product_name = product_info['brand_name']
        
        response = f"""
        {product_name}についてお尋ねいただき、ありがとうございます。
        
        カテゴリ: {category_path}
        
        在庫の確認については、お近くのスタッフにお尋ねください。
        """
        
        return {
            'inquiry_type': 'store_inquiry/inventory',
            'response': response,
            'detected_product': product_info
        }
    
    return None
```

## 対応カテゴリ

### 1. 店舗案内関連（9種類）

- **在庫確認（inventory）**: 商品の在庫確認
- **周辺施設（facilities）**: 周辺施設の情報
- **免税対応（tax_free）**: 免税対応の可否
- **周辺観光地（tourism）**: 周辺観光地の紹介
- **営業時間・アクセス（business_hours）**: 営業時間やアクセス方法
- **支払い方法（payment）**: 支払い方法に関する案内
- **駐車場（parking）**: 駐車場の有無や場所
- **店舗サービス（services）**: 店舗が提供するサービス
- **トイレの場所（toilet_location）**: トイレの場所を案内

### 2. 遺失物対応（lost_and_found）

```python
def handle_lost_and_found(user_text):
    """
    遺失物対応の処理
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        response: 遺失物対応応答
    """
    lost_keywords = ["遺失物", "落とし物", "忘れ物", "なくした"]
    
    if any(keyword in user_text for keyword in lost_keywords):
        response = """
        遺失物についてお尋ねいただき、ありがとうございます。
        
        【店舗内で拾われた場合】
        お近くのスタッフにお尋ねください。
        
        【店舗外で拾われた場合】
        警察への相談をお勧めします。
        """
        
        return {
            'inquiry_type': 'lost_and_found',
            'response': response
        }
    
    return None
```

## ハイブリッド検出方式

### 1. キーワードマッチング（高速）

```python
def keyword_based_store_detection(user_text):
    """
    キーワードマッチングによる店舗案内検出（高速）
    """
    store_keywords = {
        'store_inquiry/inventory': ['在庫', 'ありますか', 'どこ', '場所は'],
        'store_inquiry/facilities': ['施設', '周辺'],
        'store_inquiry/tax_free': ['免税', 'タックスフリー'],
        'lost_and_found': ['遺失物', '落とし物', '忘れ物'],
        'store_inquiry/toilet_location': ['トイレ', 'お手洗い']
    }
    
    for inquiry_type, keywords in store_keywords.items():
        if any(keyword in user_text for keyword in keywords):
            return {
                'inquiry_type': inquiry_type,
                'confidence': 0.9,
                'method': 'keyword_matching'
            }
    
    return None
```

### 2. LLM分類（高精度）

```python
def llm_based_store_classification(user_text):
    """
    LLMによる店舗案内分類（高精度）
    """
    prompt = f"""
    ユーザーの入力を以下の店舗案内カテゴリに分類してください：
    
    - store_inquiry/inventory: 在庫確認
    - store_inquiry/facilities: 周辺施設
    - store_inquiry/tax_free: 免税対応
    - store_inquiry/tourism: 周辺観光地
    - store_inquiry/business_hours: 営業時間・アクセス
    - store_inquiry/payment: 支払い方法
    - store_inquiry/parking: 駐車場
    - store_inquiry/services: 店舗サービス
    - store_inquiry/toilet_location: トイレの場所
    - lost_and_found: 遺失物関連
    
    ユーザー入力: {user_text}
    
    以下のJSON形式で返答してください：
    {{
        "inquiry_type": "カテゴリ名",
        "confidence": 0.0-1.0,
        "reasoning": "分類の理由"
    }}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは店舗案内AIアシスタントです。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=200
    )
    
    return parse_store_classification_response(response.choices[0].message.content)
```

## 症状キーワードとの区別

「うんこしたい」のような表現は、症状キーワードがない場合は店舗案内として処理：

```python
def distinguish_symptom_from_store_inquiry(user_text):
    """
    症状キーワードと店舗案内を区別
    
    Args:
        user_text: ユーザーの入力テキスト
    
    Returns:
        is_store_inquiry: 店舗案内として処理するか
    """
    symptom_keywords = ["出ない", "便秘", "痛い", "痒い"]
    has_symptom_keyword = any(keyword in user_text for keyword in symptom_keywords)
    
    if has_symptom_keyword:
        return False  # 医薬品推奨を優先
    
    # 症状キーワードがない場合は店舗案内として処理
    store_keywords = ["トイレ", "お手洗い", "場所"]
    has_store_keyword = any(keyword in user_text for keyword in store_keywords)
    
    return has_store_keyword
```

## トラブルシューティング

### 問題: 商品が検出されない

**原因**: 商品データベースに該当する商品が登録されていない

**解決策**: 
- 商品データベースの拡充
- ユーザーフィードバックからの学習

### 問題: 誤検出（症状が店舗案内として検出される）

**原因**: 症状キーワードとの区別が不十分

**解決策**: 
- 症状キーワードの優先チェック
- 文脈を考慮した判定

### 問題: パフォーマンスの低下

**原因**: 商品データベースの検索が遅い

**解決策**: 
- インデックスの構築
- キャッシュ機能の実装

## まとめ

店舗案内機能の実装により、2,362件の商品データベースに対応した包括的な店舗案内システムを実現しました。商品検出機能と階層的カテゴリ分類により、より実用的なシステムになりました。

今後も、より多くの商品に対応し、検出精度の向上を続けていきます。
