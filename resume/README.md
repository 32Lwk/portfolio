# Resume (LaTeX → PDF)

Microsoft Solutions Engineer Intern 向けの英文レジュメです。

## ビルド方法

**フォントに Times New Roman を使用しているため、XeLaTeX でビルドしてください。**

```bash
cd resume
xelatex -jobname=Resume_Yuto_Kawashima resume.tex
```

- 上記で **Resume_Yuto_Kawashima.pdf** が生成されます（提出用ファイル名）。
- Overleaf の場合: Compiler を **XeLaTeX** に変更し、生成された PDF をダウンロード後に `Resume_Yuto_Kawashima.pdf` にリネームしてください。
- 2回実行すると /PageLabels の警告が消えます（任意）。

## Demo URL の扱い

- **Resume 上**: Projects セクションで「Chat-based OTC Medicine Consultation Tool」の直下に  
  `GitHub | Demo` の1行でリンクを記載しています。PDF上でクリック可能です。
- **運用**: 提出用PDFではそのままフルURL（Demo: https://medicine-recommend-...）で問題ありません。  
  採用側が実際に触れることで、技術力・製品感のアピールになります。
- **短縮したい場合**: リンク先は変えず、表示だけ `yutok.dev` や「Demo available on request」にする手もあります。  
  技術営業職では **Demo を出した方が有利**なことが多いため、現状の「GitHub | Demo」のままを推奨しています。

## ファイル

- `resume.tex` … ソース（編集はここ）
- `Resume_Yuto_Kawashima.pdf` … 出力（提出用。上記 `-jobname` でビルドした場合）
- `resume.aux`, `resume.log`, `resume.out` … ビルド生成物（削除してよい）

## 内容の更新

- 学歴・職歴・プロジェクト・スキル・資格・賞はすべて `resume.tex` 内の該当セクションを編集してください。
- 1ページに収めるため、箇条書きや説明は簡潔にしています。長くなりそうな場合は文言を削るか、別セクションと統合してください。
