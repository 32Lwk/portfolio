"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { MapPin, ImageIcon } from "lucide-react";
import { getHometown } from "@/lib/hometown";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";

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
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
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
  const preview = useAboutPreview();
  const hometown = preview?.hometown ?? getHometown();
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
                    {hometown.badgeLabel ?? "生まれ育った町"}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    {hometown.badge ?? "出身地"}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-semibold">
                  {hometown.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {hometown.description}
                </p>

                {hometown.images && hometown.images.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {hometown.images.map((img, index) => (
                      <HometownImage
                        key={index}
                        src={img.src}
                        alt={img.alt}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
