# マスターデータベース - 川嶋宥翔

> 最終更新日: 2026年2月12日  
> すべての情報を統合した包括的なデータベース

---

## 📚 関連ドキュメント

このマスターデータベースは、以下のドキュメントと連携しています：

1. **[personal-info.md](./personal-info.md)** - Step1で取得した個人情報・属性情報
2. **[data-inventory.md](./data-inventory.md)** - 既存データの整理と不足情報のリスト
3. **[technical-info.md](./technical-info.md)** - 技術情報・実装詳細

---

## 🎯 クイックリファレンス

### 基本情報
- **名前**: 川嶋宥翔 (Kawashima Yuto)
- **生年月日**: 2005年10月28日
- **出身地**: 和歌山県有田郡有田川町（和歌山市で生誕）
- **居住地**: 愛知県
- **大学**: 名古屋大学 理学部物理学科 2年生（2028年3月卒業予定）
- **職業**: フルスタックエンジニア / 登録販売者（マツモトキヨシ）

### 連絡先
- **メール**: kawashima.yuto.c2@s.mail.nagoya-u.ac.jp
- **GitHub**: https://github.com/32Lwk
- **LinkedIn**: https://www.linkedin.com/in/kawashimayuto/
- **Instagram**: https://www.instagram.com/32_lwk
- **問い合わせフォーム**: https://forms.gle/9CjKdDGoegjy1isPA

### パーソナリティ
- **MBTI**: ENFJ型（主人公）
- **恋愛MBTI**: FCRE型（ちゃっかりうさぎ）
- **モットー**: 「人や社会に影響を与えるシステムは、誤ってはいけない」

---

## 📊 データファイル一覧

### JSONデータファイル
- `content/about/skills.json` - スキルデータ（22スキル）
- `content/projects/projects.json` - プロジェクトデータ（5プロジェクト）
- `lib/resume.ts` - Resumeデータ（TypeScript）

### Markdownデータファイル
- `content/about/personal-info.md` - 個人情報まとめ
- `content/about/data-inventory.md` - データインベントリ
- `content/about/technical-info.md` - 技術情報
- `content/about/master-database.md` - このファイル
- `content/blog/*.md` - ブログ記事

---

## 🎨 必要な画像アセット（優先度順）

### 🔴 高優先度（必須）

1. **プロフィール画像**
   - パス: `/images/about/profile.jpg` または `.png`
   - サイズ: 400x400px以上（正方形）、または 1200x630px（OGP用）
   - 用途: Aboutページ、OGP画像

2. **プロジェクト画像（5つ）**
   - `/images/projects/medicine-chat-tool.png` - チャット型医薬品相談ツール
   - `/images/projects/latent-space-medicine.png` - 医薬品推奨アルゴリズム
   - `/images/projects/security-validation.png` - セキュリティ・入力検証システム
   - `/images/projects/multimodal-ux.png` - マルチモーダル・多言語UX
   - `/images/projects/cloud-infrastructure.png` - クラウド基盤・運用
   - サイズ: 1200x675px（16:9）推奨
   - 用途: プロジェクトカード、ポートフォリオページ

3. **OGP画像**
   - パス: `/images/ogp/og-image.jpg`
   - サイズ: 1200x630px（Twitter推奨サイズ）
   - 用途: SNSシェア時の表示画像

4. **ファビコン**
   - `/favicon.ico` (16x16px, 32x32px)
   - `/favicon-16x16.png`
   - `/favicon-32x32.png`
   - `/apple-touch-icon.png` (180x180px)
   - 用途: ブラウザタブ、ブックマーク

5. **Resume PDF**
   - パス: `/public/resume/resume.pdf`
   - 形式: PDF（A4サイズ、印刷最適化）
   - 用途: Resumeページでダウンロード可能にする

### 🟡 中優先度（推奨）

6. **背景画像**
   - パス: `/images/about/background.jpg`
   - サイズ: 1920x1080px以上
   - 用途: Aboutページの背景

7. **プロジェクトスクリーンショット**
   - 各プロジェクトの複数のスクリーンショット
   - モバイル/デスクトップ表示の比較
   - 用途: プロジェクト詳細ページ

### 🟢 低優先度（オプション）

8. **スキルアイコン**
   - 各技術のロゴ（Simple IconsなどのSVG）
   - 用途: スキルセクションの視覚化

9. **デモ動画**
   - YouTube/Vimeoリンク
   - 用途: プロジェクトの機能紹介

---

## 📝 必要なコンテンツ

### ブログ記事（最低3-5記事）

#### 技術記事
- 「医療相談用AIの安全性設計」
- 「ルールベース＋LLMのハイブリッド推奨アルゴリズム」
- 「OTC薬データの正規化とスコアリング」

#### キャリア記事
- 「ドラッグストア経験からAI医薬品相談ツール開発まで」
- 「未踏事業応募で得た学び」（採択後）

#### 学習記録
- 「FlaskのBlueprint構成とSRP」
- 「Render→GCP Cloud Runへの移行手順」
- 「Neon PostgreSQLの選定理由と運用」

#### 医療×IT記事
- 「セルフメディケーションとAI」
- 「薬局現場のDXの可能性」
- 「多言語・アクセシビリティで広げる医療情報アクセス」

---

## 🔍 不足している情報（追加で収集が必要）

### 数値的な実績
- [ ] チャット型医薬品相談ツールの利用者数
- [ ] 月間アクセス数、PV数
- [ ] レスポンスタイム、エラー率、可用性
- [ ] GitHub統計（コミット数、コントリビューション数、スター数）

### 受賞歴・表彰
- [ ] 未踏事業（採択後、詳細を追加）
- [ ] その他のコンテスト・表彰
- [ ] メディア掲載情報
- [ ] 講演・発表歴

### パーソナル情報
- [ ] 趣味
- [ ] 好きな技術・ツール
- [ ] 開発環境（OS、エディタ、よく使うツール）
- [ ] 学習リソース（よく読むブログ、好きな技術書）
- [ ] 影響を受けた人・書籍

### チーム開発経験
- [ ] 参加したプロジェクト
- [ ] 役割（リーダー、メンバーなど）
- [ ] メンター・教育経験

### 将来の目標
- [ ] 短期目標（1年以内）
- [ ] 中期目標（3-5年）
- [ ] 長期目標（10年以上）
- [ ] 夢・ビジョン

---

## 🛠️ 技術スタック（実装済み）

### フロントエンド
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5.x
- Tailwind CSS 4.x
- shadcn/ui
- framer-motion 12.34.0
- next-themes 0.4.6

### バックエンド・API
- OpenAI API 4.20.0（ビルド時生成）
- DeepL API（プロジェクトで使用）

### コンテンツ管理
- gray-matter 4.0.3
- next-mdx-remote 6.0.0
- date-fns 4.1.0

### デプロイ
- Vercel（静的サイト）
- GitHub（ソースコード管理）

---

## 📈 プロジェクト一覧

### 1. チャット型医薬品相談ツール（β版）
- **カテゴリ**: Web Application
- **技術**: Python 3.9+, Flask 3.0, OpenAI GPT-4o-mini, PostgreSQL (Neon), DeepL API, Pandas/NumPy, Vanilla JS (ES6+), Gunicorn, Docker, GCP Cloud Run
- **GitHub**: https://github.com/32Lwk/medicine-recommend-system/
- **デモ**: https://medicine-recommend-340042923793.asia-northeast1.run.app/
- **開発開始**: 2025年4月
- **ステータス**: 継続中

### 2. 医薬品推奨アルゴリズム（潜在空間の実装）
- **カテゴリ**: Algorithm
- **技術**: Python, Pandas, 独自スコアリングエンジン, 薬効データベース連携
- **GitHub**: https://github.com/32Lwk/latent-space-medicine
- **開発開始**: 2025年4月

### 3. セキュリティ・入力検証システム
- **カテゴリ**: Web Application
- **技術**: Python, Flask Session, PostgreSQL, キーワードベース＋リスク評価
- **GitHub**: https://github.com/32Lwk/medicine-recommend-system
- **開発開始**: 2025年4月

### 4. マルチモーダル・多言語UX
- **カテゴリ**: Web Application
- **技術**: DeepL API, Vanilla JS, CSS（レスポンシブ）, UDフォント
- **GitHub**: https://github.com/32Lwk/medicine-recommend-system
- **開発開始**: 2025年4月

### 5. クラウド基盤・運用
- **カテゴリ**: Infrastructure
- **技術**: GCP Cloud Run, Neon PostgreSQL, Docker, GitHub Actions
- **GitHub**: https://github.com/32Lwk/medicine-recommend-system
- **開発開始**: 2025年4月

---

## 🎓 学歴タイムライン

1. **2005年10月28日**: 生誕（和歌山市）
2. **調査中 - 2012年3月**: 金屋第一保育所（現在：金屋第一こども園）
3. **2012年 - 2018年**: 鳥屋城小学校
4. **2018年 - 2021年**: 和歌山県立向陽中学校（中学受験）
5. **2021年 - 2024年**: 和歌山県立向陽高等学校
6. **2024年 - 現在**: 名古屋大学 理学部物理学科（2028年3月卒業予定）

---

## 💼 経歴タイムライン

1. **2024年4月**: プログラミング学習開始（Python、JavaScript、HTML/CSS）
2. **2024年4月 - 継続中**: マツモトキヨシ（登録販売者として勤務）
3. **2025年4月**: チャット型医薬品相談ツール開発開始
4. **2025年**: Render→GCP Cloud Run移行
5. **2025年**: Cloud SQL→Neon PostgreSQL移行

---

## 🏆 資格

- 登録販売者資格（取得済み）
- 基本情報技術者試験（取得済み）
- 普通免許（取得済み）

---

## 💡 価値観・信念

### モットー
> 「人や社会に影響を与えるシステムは、誤ってはいけない」

### 開発における3つの信念

1. **LLMや人の判断に「丸投げしない」**
   - 判断が結果に直結する領域では、ルール・制約・例外処理をコードで明示
   - 「なぜこの結果になったか」を説明できる設計を守る

2. **"正しく動く"だけでなく"誤らせない"**
   - 正常系よりも異常系・境界条件・誤入力・想定外入力を先に考える
   - 危険なケースでは、あえて何も返さない／医師案内にするという判断も設計に含める

3. **属人化しない仕組みを作る**
   - 一人の理解に依存しないよう責務分離・ログ・テスト・READMEを重視
   - チームや将来の自分が引き継げる設計を目指す

### キャリアの方向性

#### 中期（5年程度）
信頼性が求められる基盤・インフラ領域で実務経験を積む。Linux・ネットワーク・運用を含め、「止めてはいけないシステム」を任されるエンジニアになる。

#### 長期（5〜10年）
技術・ドメイン・運用を横断的に理解し、プロジェクト全体の安全性・正確性に責任を持つ立場へ。「この人に任せれば大丈夫」と言われる信頼ベースのリーダーになることが目標。

---

## 📋 チェックリスト

### 画像・メディア
- [ ] プロフィール画像
- [ ] プロジェクト画像（5つ）
- [ ] OGP画像
- [ ] ファビコン（複数サイズ）
- [ ] Resume PDF
- [ ] 背景画像（オプション）
- [ ] プロジェクトスクリーンショット（オプション）

### コンテンツ
- [ ] ブログ記事（最低3-5記事）
- [ ] プロジェクト詳細情報の追加
- [ ] 受賞歴・表彰情報

### データ
- [ ] GitHub統計情報
- [ ] プロジェクトの数値的成果
- [ ] 趣味・パーソナル情報
- [ ] 開発環境情報

---

## 🔗 外部リンク

### プロジェクト
- [チャット型医薬品相談ツール](https://medicine-recommend-340042923793.asia-northeast1.run.app/)
- [GitHub - medicine-recommend-system](https://github.com/32Lwk/medicine-recommend-system/)
- [GitHub - latent-space-medicine](https://github.com/32Lwk/latent-space-medicine)

### SNS
- [GitHub](https://github.com/32Lwk)
- [LinkedIn](https://www.linkedin.com/in/kawashimayuto/)
- [Instagram](https://www.instagram.com/32_lwk)

### その他
- [問い合わせフォーム](https://forms.gle/9CjKdDGoegjy1isPA)

---

## 📝 メモ・補足情報

- ブログは本サイトに統合予定（将来的にQiitaやZennも検討）
- 未踏事業への応募経験あり（採択後、詳細を追加予定）
- 自伝的なブログとして、日々の日記や個人的な話、学習の成果、開発の発表、トラブルシューティングの結果なども気軽に書けるようにしたい
- 出身地の有田川町は、みかんや山椒が有名で美しい町だが、実家の近くにドラッグストアがなく、最寄りのドラッグストアまでは5km、車がないと薬を買いに行けない地域

---

*このマスターデータベースは、サイト作成に必要なすべての情報を統合したものです。定期的に更新し、最新の情報を維持してください。*
