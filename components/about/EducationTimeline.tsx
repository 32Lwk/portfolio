"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/** 学歴1件。image: 学校の写真、periodImage: そのころの写真（任意） */
const education: Array<{
  period: string;
  institution: string;
  description: string;
  type: string;
  image?: string;
  periodImage?: string;
  imageAlt?: string;
  periodImageAlt?: string;
}> = [
  {
    period: "2024年 - 現在",
    institution: "名古屋大学 理学部物理学科",
    description: "2028年3月卒業予定",
    type: "大学",
    // image: "/images/about/education/nagoya-univ.jpg",
    // periodImage: "/images/about/education/period-univ.jpg",
  },
  {
    period: "2021年 - 2024年",
    institution: "和歌山県立向陽高等学校",
    description: "",
    type: "高校",
  },
  {
    period: "2018年 - 2021年",
    institution: "和歌山県立向陽中学校",
    description: "中学受験",
    type: "中学校",
  },
  {
    period: "2012年 - 2018年",
    institution: "鳥屋城小学校",
    description: "",
    type: "小学校",
  },
  {
    period: "調査中 - 2012年3月",
    institution: "金屋第一保育所（現在：金屋第一こども園）",
    description: "",
    type: "保育所",
  },
  {
    period: "2005年10月28日",
    institution: "生誕",
    description: "和歌山市",
    type: "誕生",
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
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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
                className="relative flex items-start gap-6"
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
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
                    </div>
                    <div className="flex gap-3 sm:gap-4">
                      {item.image && (
                        <EducationImage
                          src={item.image}
                          alt={item.imageAlt ?? `${item.institution}の写真`}
                          className="h-24 w-24 sm:h-28 sm:w-28"
                        />
                      )}
                      {item.periodImage && (
                        <EducationImage
                          src={item.periodImage}
                          alt={
                            item.periodImageAlt ??
                            `${item.period}のころの写真`
                          }
                          className="h-24 w-24 sm:h-28 sm:w-28"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
