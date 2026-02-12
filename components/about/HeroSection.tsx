"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            川嶋宥翔
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            名古屋大学 理学部物理学科 2年生 / フルスタックエンジニア
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            「システムを誤らせない設計」を最優先に、医療×AI分野で個人開発に取り組んでいます。
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
