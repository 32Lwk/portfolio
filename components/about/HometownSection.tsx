"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { MapPin, ImageIcon } from "lucide-react";

/** 和歌山の画像。public/images/about/hometown/ に画像を置き、ここにパスを追加 */
const hometownImages: Array<{ src: string; alt: string }> = [
  { src: "/images/about/hometown/wakayama-1.jpg", alt: "和歌山の風景1" },
  { src: "/images/about/hometown/wakayama-2.jpg", alt: "和歌山の風景2" },
  { src: "/images/about/hometown/wakayama-3.jpg", alt: "和歌山の風景3" },
  { src: "/images/about/hometown/wakayama-4.jpg", alt: "和歌山の風景4" },
  { src: "/images/about/hometown/wakayama-5.jpg", alt: "和歌山の風景5" },
  { src: "/images/about/hometown/wakayama-6.jpg", alt: "和歌山の風景6" },
];

function HometownImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="text-muted-foreground h-10 w-10" />
        </div>
      )}
    </div>
  );
}

export function HometownSection() {
  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">出身地</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-8">
            <ScrollReveal
              delay={0}
              direction="left"
              className="relative flex items-start gap-6"
            >
              <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    生まれ育った町
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    出身地
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-semibold">
                  和歌山県有田郡有田川町
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  山椒が有名で美しい町です。実家の近くにドラッグストアがなく、最寄りまで5km。車がなければ薬一つ買いに行けない地域で育った経験が、誰もがどこでも安心して必要な情報やサービスにアクセスできる社会を作りたいという想いの原点になっています。
                </p>

                {/* 和歌山の画像グリッド */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {hometownImages.map((img, index) => (
                    <HometownImage
                      key={index}
                      src={img.src}
                      alt={img.alt}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
