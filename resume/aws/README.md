# Resume (LaTeX → PDF) - AWS Professional Services Intern

AWS Professional Services Intern 向けの英文レジュメです。

## ビルド方法

**フォントに Times New Roman を使用しているため、XeLaTeX でビルドしてください。**

```bash
cd resume/aws
xelatex -jobname=Resume_Yuto_Kawashima_AWS resume.tex
```

- 上記で **Resume_Yuto_Kawashima_AWS.pdf** が生成されます（提出用ファイル名）。
- Overleaf の場合: Compiler を **XeLaTeX** に変更し、生成された PDF をダウンロード後に `Resume_Yuto_Kawashima_AWS.pdf` にリネームしてください。
- 2回実行すると /PageLabels の警告が消えます（任意）。

## Demo URL の扱い

- **Resume 上**: Projects セクションで「Chat-based OTC Medicine Consultation Tool」の直下に  
  `GitHub | Demo` の1行でリンクを記載しています。PDF上でクリック可能です。
- **運用**: 提出用PDFではそのままフルURL（Demo: https://medicine-recommend-...）で問題ありません。  
  採用側が実際に触れることで、技術力・製品感のアピールになります。

## ファイル

- `resume.tex` … ソース（編集はここ）
- `Resume_Yuto_Kawashima_AWS.pdf` … 出力（提出用。上記 `-jobname` でビルドした場合）
- `resume.aux`, `resume.log`, `resume.out` … ビルド生成物（削除してよい）

## 内容の更新

- 学歴・職歴・プロジェクト・スキル・資格・賞はすべて `resume.tex` 内の該当セクションを編集してください。
- 1枚に収めるため、Objective と Statement of Purpose を簡潔にまとめています。
- AWS向けの志望動機は、クラウドアーキテクチャ、顧客課題解決、技術とビジネスの両面からのアプローチに焦点を当てています。
