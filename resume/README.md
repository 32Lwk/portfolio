# Resume (LaTeX → PDF)

企業別にレジュメを管理しています。

## フォルダ構成

- `resume.tex` - 汎用版（企業固有の内容を含まない）
- `microsoft/` - Microsoft Solutions Engineer Intern 向け
- `aws/` - AWS Professional Services Intern 向け

各フォルダ内の `README.md` を参照してください。

## 共通のビルド要件

**フォントに Times New Roman を使用しているため、XeLaTeX でビルドしてください。**

```bash
# 汎用版
cd resume
xelatex -jobname=Resume_Yuto_Kawashima resume.tex

# Microsoft向け
cd resume/microsoft
xelatex -jobname=Resume_Yuto_Kawashima resume.tex

# AWS向け
cd resume/aws
xelatex -jobname=Resume_Yuto_Kawashima_AWS resume.tex
```

Overleaf の場合: Compiler を **XeLaTeX** に変更してください。
