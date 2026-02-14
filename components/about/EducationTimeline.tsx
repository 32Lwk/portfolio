"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** 思い出1件 */
type Memory = {
  image?: string;
  imageAlt?: string;
  text: string;
};

/** 学歴1件 */
type EducationItem = {
  period: string;
  institution: string;
  description: string;
  type: string;
  /** 学校の写真（ホバー・モーダルで表示） */
  image?: string;
  imageAlt?: string;
  /** 思い出（モーダルで表示） */
  memories?: Memory[];
};

const education: EducationItem[] = [
  {
    period: "2024年 - 現在",
    institution: "名古屋大学 理学部物理学科",
    description: "2028年3月卒業予定",
    type: "大学",
    image: "/images/about/education/nagoya-univ.jpg",
    imageAlt: "名古屋大学",
    memories: [
      {
        text: "宇宙物理の研究を志して入学。C研（理論宇宙物理学）を目指して日々勉学に励んでいます。",
      },
      {
        text: "キャンパスの四季の移ろいが美しく、特に東山キャンパスの桜と紅葉がお気に入りです。",
      },
    ],
  },
  {
    period: "2021年 - 2024年",
    institution: "和歌山県立向陽高等学校",
    description: "",
    type: "高校",
    image: "/images/about/education/koyo-high.jpg",
    imageAlt: "和歌山県立向陽高等学校",
    memories: [
      {
        text: "硬式テニス部に所属。部活動を通じて仲間と切磋琢磨した3年間でした。",
      },
      {
        text: "進路選択で理学の道を選び、物理への興味が深まった時期です。",
      },
    ],
  },
  {
    period: "2018年 - 2021年",
    institution: "和歌山県立向陽中学校",
    description: "中学受験",
    type: "中学校",
    image: "/images/about/education/koyo-junior.jpg",
    imageAlt: "和歌山県立向陽中学校",
    memories: [
      {
        text: "中学受験を経て入学。軟式テニス部でスポーツに打ち込みました。",
      },
    ],
  },
  {
    period: "2012年 - 2018年",
    institution: "鳥屋城小学校",
    description: "",
    type: "小学校",
    image: "/images/about/education/toriyakijo-elementary.jpg",
    imageAlt: "鳥屋城小学校",
    memories: [
      {
        text: "地元の小学校で6年間。友達と走り回ったグラウンドや、図書館で過ごした時間が懐かしいです。",
      },
    ],
  },
  {
    period: "調査中 - 2012年3月",
    institution: "金屋第一保育所（現在：金屋第一こども園）",
    description: "",
    type: "保育所",
    image: "/images/about/education/kanaya-hoikuen.jpg",
    imageAlt: "金屋第一こども園",
    memories: [
      {
        text: "幼少期を過ごした保育所。現在は金屋第一こども園として施設が続いています。",
      },
    ],
  },
  {
    period: "2005年10月28日",
    institution: "生誕",
    description: "和歌山市",
    type: "誕生",
    memories: [
      {
        text: "和歌山市で生まれました。",
      },
    ],
  },
];

function EducationImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border bg-muted",
        className
      )}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 96px, 112px"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <GraduationCap className="text-muted-foreground h-8 w-8" />
        </div>
      )}
    </div>
  );
}

export function EducationTimeline() {
  const [openItem, setOpenItem] = useState<EducationItem | null>(null);

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">学歴</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-8">
            {education.map((item, index) => (
              <ScrollReveal
                key={index}
                delay={index * 0.1}
                direction="left"
                className="relative"
              >
                <div className="group relative flex items-start gap-6">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenItem(item)}
                    className="flex flex-1 flex-col gap-4 pb-8 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.period}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                          {item.type}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-semibold">
                        {item.institution}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground/80">
                        クリックで詳細を見る
                      </p>
                    </div>
                    {/* ホバーで学校写真を表示 */}
                    {item.image && (
                      <div
                        className={cn(
                          "shrink-0 opacity-0 transition-opacity duration-200",
                          "group-hover:opacity-100 group-focus-within:opacity-100"
                        )}
                      >
                        <EducationImage
                          src={item.image}
                          alt={item.imageAlt ?? `${item.institution}の写真`}
                          className="h-24 w-24 sm:h-28 sm:w-28"
                        />
                      </div>
                    )}
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* モーダル: 学校の詳細・思い出 */}
      <Dialog
        open={!!openItem}
        onOpenChange={(open) => !open && setOpenItem(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {openItem && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    {openItem.type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {openItem.period}
                  </span>
                </div>
                <DialogTitle className="text-xl">
                  {openItem.institution}
                </DialogTitle>
                {openItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {openItem.description}
                  </p>
                )}
              </DialogHeader>

              {/* 学校写真 */}
              {openItem.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  <EducationImage
                    src={openItem.image}
                    alt={openItem.imageAlt ?? `${openItem.institution}の写真`}
                    className="h-full w-full"
                  />
                </div>
              )}

              {/* 思い出 */}
              {openItem.memories && openItem.memories.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">思い出</h4>
                  <div className="space-y-4">
                    {openItem.memories.map((memory, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-2 sm:flex-row sm:gap-4"
                      >
                        {memory.image && (
                          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-24 sm:w-32">
                            <EducationImage
                              src={memory.image}
                              alt={
                                memory.imageAlt ??
                                `${openItem.institution}の思い出写真`
                              }
                              className="h-full w-full"
                            />
                          </div>
                        )}
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {memory.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
