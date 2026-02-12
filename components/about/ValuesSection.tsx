"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Shield, Code, Users } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "LLMや人の判断に「丸投げしない」",
    description:
      "判断が結果に直結する領域では、ルール・制約・例外処理をコードで明示することを重視。「なぜこの結果になったか」を説明できる設計を守る。",
  },
  {
    icon: Code,
    title: '"正しく動く"だけでなく"誤らせない"',
    description:
      "正常系よりも異常系・境界条件・誤入力・想定外入力を先に考える。危険なケースでは、あえて何も返さない／医師案内にするという判断も設計に含める。",
  },
  {
    icon: Users,
    title: "属人化しない仕組みを作る",
    description:
      "一人の理解に依存しないよう責務分離・ログ・テスト・READMEを重視。チームや将来の自分が引き継げる設計を目指す。",
  },
];

export function ValuesSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-4 text-3xl font-bold">価値観・信念</h2>
        <div className="mb-8 rounded-lg border bg-card p-6">
          <p className="text-lg font-semibold text-primary">
            「人や社会に影響を与えるシステムは、誤ってはいけない」
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            便利さや速さよりも、正しさ・再現性・安全性に責任を持つことを最優先にしています。技術は自己満足のためではなく、使う人が安心できる状態をつくるためにあると考えています。
          </p>
        </div>
        <div className="space-y-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <ScrollReveal
                key={index}
                delay={index * 0.1}
                direction="left"
                className="flex gap-4 rounded-lg border bg-card p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
        <div className="mt-8 rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-xl font-semibold">キャリアの方向性</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">中期（5年程度）</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                信頼性が求められる基盤・インフラ領域で実務経験を積む。Linux・ネットワーク・運用を含め、「止めてはいけないシステム」を任されるエンジニアになる。
              </p>
            </div>
            <div>
              <h4 className="font-semibold">長期（5〜10年）</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                技術・ドメイン・運用を横断的に理解し、プロジェクト全体の安全性・正確性に責任を持つ立場へ。「この人に任せれば大丈夫」と言われる信頼ベースのリーダーになることが目標。
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
