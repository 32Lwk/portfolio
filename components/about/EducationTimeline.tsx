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
import {
  getEducation,
  type EducationItem,
  type EducationMemory,
} from "@/lib/education";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";

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
  const preview = useAboutPreview();
  const education = preview?.education ?? getEducation();
  if (education.length === 0) return null;

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
                    {openItem.memories.map((memory: EducationMemory, i: number) => {
                      const imgs =
                        (memory.images?.length ?? 0) > 0
                          ? memory.images!
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
                                  <EducationImage
                                    src={img.src}
                                    alt={
                                      img.alt ??
                                      `${openItem.institution}の思い出写真`
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
