"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Briefcase } from "lucide-react";

const career = [
  {
    period: "2024年4月 - 継続中",
    title: "マツモトキヨシ（登録販売者）",
    description: "登録販売者として勤務。高齢者とのコミュニケーション、言語の壁、人手不足などの課題を現場で経験し、これが後の医薬品相談ツール開発の動機となった。",
    type: "職歴",
  },
  {
    period: "2024年4月",
    title: "プログラミング学習開始",
    description: "Python、JavaScript、HTML/CSSの学習を開始。独学でWebアプリケーション開発の基礎を習得。",
    type: "学習",
  },
  {
    period: "2025年4月 - 継続中",
    title: "チャット型医薬品相談ツール（β版）開発",
    description: "ドラッグストアでの現場経験を踏まえ、医療×AI分野での個人開発プロジェクトを開始。要件定義から設計・開発・運用まで一貫して担当。独自スコアリングアルゴリズム、セキュリティ機能、多言語対応、アクセシビリティ対応など、継続的な機能拡張と改善を実施。",
    type: "開発",
  },
];

export function CareerTimeline() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">経歴</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-8">
            {career.map((item, index) => (
              <ScrollReveal
                key={index}
                delay={index * 0.1}
                direction="left"
                className="relative flex items-start gap-6"
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.period}
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
