"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Award, Trophy } from "lucide-react";
import { getAwards, type AwardItem } from "@/lib/awards";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function AwardImage({
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
          <Trophy className="text-muted-foreground h-8 w-8" />
        </div>
      )}
    </div>
  );
}

export function AwardsSection() {
  const preview = useAboutPreview();
  const awards = preview?.awards ?? getAwards();
  const [openItem, setOpenItem] = useState<AwardItem | null>(null);

  if (awards.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">大会・賞歴</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-8">
            {awards.map((item, index) => (
              <ScrollReveal
                key={index}
                delay={index * 0.1}
                direction="left"
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setOpenItem(item)}
                  className="group relative flex w-full items-start gap-6 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                    {item.type === "大会" ? (
                      <Trophy className="h-6 w-6 text-primary" />
                    ) : (
                      <Award className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.period}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      {item.result && (
                        <Badge variant="outline" className="text-xs">
                          {item.result}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    {item.organizer && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        主催：{item.organizer}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground/80">
                      クリックで詳細を見る
                    </p>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* モーダル: 大会の詳細・写真・感想 */}
      <Dialog
        open={!!openItem}
        onOpenChange={(open) => !open && setOpenItem(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {openItem && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {openItem.type}
                  </Badge>
                  {openItem.result && (
                    <Badge variant="outline" className="text-xs">
                      {openItem.result}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {openItem.period}
                  </span>
                </div>
                <DialogTitle className="text-xl">{openItem.title}</DialogTitle>
                {openItem.organizer && (
                  <p className="text-sm text-muted-foreground">
                    主催：{openItem.organizer}
                  </p>
                )}
                {openItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {openItem.description}
                  </p>
                )}
              </DialogHeader>

              {/* 大会写真 */}
              {openItem.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  <AwardImage
                    src={openItem.image}
                    alt={
                      openItem.imageAlt ??
                      `${openItem.title}の写真`
                    }
                    className="h-full w-full"
                  />
                </div>
              )}

              {/* 詳細リンク（複数） */}
              {(() => {
                const links: { label?: string; url: string }[] = (
                  (openItem.urls?.length ?? 0) > 0
                    ? openItem.urls ?? []
                    : openItem.url
                      ? [{ url: openItem.url }]
                      : []
                ).filter((link) => link.url?.trim());
                if (links.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-3">
                    {links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-primary hover:underline"
                      >
                        {link.label?.trim() ? `${link.label} →` : "詳細リンク →"}
                      </a>
                    ))}
                  </div>
                );
              })()}

              {/* 大会での写真や感想 */}
              {openItem.memories && openItem.memories.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">大会での様子・感想</h4>
                  <div className="space-y-4">
                    {openItem.memories.map((memory, i) => {
                      const imgs: { src: string; alt?: string }[] =
                        (memory.images?.length ?? 0) > 0
                          ? memory.images ?? []
                          : memory.image
                            ? [{ src: memory.image, alt: memory.imageAlt }]
                            : [];
                      return (
                        <div
                          key={i}
                          className="flex flex-col gap-2 sm:flex-row sm:gap-4"
                        >
                          {imgs.length > 0 && (
                            <div className="flex shrink-0 flex-wrap gap-2">
                              {imgs.map((img, j) => (
                                <div
                                  key={j}
                                  className="relative h-32 w-40 overflow-hidden rounded-lg border bg-muted sm:h-24 sm:w-32"
                                >
                                  <AwardImage
                                    src={img.src}
                                    alt={
                                      img.alt ?? `${openItem.title}の写真`
                                    }
                                    className="h-full w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {memory.text}
                          </p>
                        </div>
                      );
                    })}
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
