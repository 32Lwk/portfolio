"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { MikanTree } from "@/components/animations/MikanTree";

export function HometownSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-6 text-3xl font-bold">出身地</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-8 mb-8">
            私は和歌山県の有田郡有田川町という町で生まれ育ちました。みかんや山椒が有名で美しい町ですが、実家の近くにドラッグストアがありませんでした。最寄りのドラッグストアまでは5km、車一つないと薬一つ買いに行けない地域でした。
          </p>
          
          {/* みかんの木アニメーション */}
          <div className="my-12 p-8 bg-muted/50 rounded-2xl border-2 border-primary/20">
            <MikanTree />
          </div>
          
          <p className="text-lg leading-8 mt-8">
            この過疎地での経験が、誰もがどこでも安心して必要な情報やサービスにアクセスできる社会を作りたいという想いの原点になっています。
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
