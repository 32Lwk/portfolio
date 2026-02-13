"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function BioSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-6 text-3xl font-bold">自己紹介</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-8">
            名古屋大学 理学部物理学科に在籍する大学生です。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。
          </p>
          <p className="mt-4 text-lg leading-8">
            私はもともと「人の生活を支える仕組み」に興味があり、大学では物理学を学びながら、独学でプログラミングを始めました。特に、現実世界での失敗が人に直接影響する分野において、技術が果たす責任の大きさに強く惹かれています。
          </p>
          <p className="mt-4 text-lg leading-8">
            ドラッグストアで登録販売者として勤務する中で、高齢者の聴覚的な課題、外国人のお客様との言語の壁、慢性的な人手不足などにより、十分な医薬品相談が行えない現場を目の当たりにしてきました。さらに、ネット購入の普及により、相談を介さずに誤った医薬品を選んでしまうリスクが高まっている現状にも強い問題意識を持ちました。
          </p>
          <p className="mt-4 text-lg leading-8">
            また、私は和歌山県の有田郡有田川町という町で生まれ育ちました。みかんや山椒が有名で美しい町ですが、実家の近くにドラッグストアがありませんでした。最寄りのドラッグストアまでは5km、車一つないと薬一つ買いに行けない地域でした。
          </p>
          <p className="mt-4 text-lg leading-8">
            このドラッグストアと過疎地の現状をテクノロジーで解決し、「誰もが、どこでも安心して薬を選べる社会」を作りたい。それが本プロジェクトの出発点です。
          </p>
          <p className="mt-4 text-lg leading-8">
            こうした背景から、「誰もが安全に薬を選べる環境を、技術で実現したい」と考え、医薬品推奨チャットツールを完全個人開発しました。開発においては、LLMに判断を委ねるのではなく、禁忌・相互作用・年齢・妊娠・授乳などの条件をコード上のルールとして厳格に管理し、再現性と安全性を最優先に設計しています。
          </p>
          <p className="mt-4 text-lg leading-8">
            また、コード規模が大きくなるにつれ、責務分離や状態管理、保守性の重要性を痛感し、大規模リファクタリングやテスト整備にも取り組みました。この経験を通じて、信頼されるシステムは「高度な技術」だけでなく、「誠実な設計と地道な改善」によって支えられていると実感しています。
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
