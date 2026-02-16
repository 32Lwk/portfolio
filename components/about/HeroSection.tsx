"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getHero } from "@/lib/hero";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

function HeroImage({
  src,
  alt,
  sizePx,
  borderPx,
  shape,
  borderRadiusPx,
  positionXPercent,
  positionYPercent,
}: {
  src: string;
  alt: string;
  sizePx?: number;
  borderPx?: number;
  shape?: "circle" | "square";
  borderRadiusPx?: number;
  positionXPercent?: number;
  positionYPercent?: number;
}) {
  const [hasError, setHasError] = useState(false);
  const style: React.CSSProperties = {};
  if (sizePx != null) {
    style.width = sizePx;
    style.height = sizePx;
  }
  if (borderPx != null) {
    style.borderWidth = borderPx;
  }
  const isCircle = shape !== "square";
  if (shape === "square" && borderRadiusPx != null && borderRadiusPx > 0) {
    style.borderRadius = borderRadiusPx;
  }
  const objectPosition =
    positionXPercent != null || positionYPercent != null
      ? `${positionXPercent ?? 50}% ${positionYPercent ?? 50}%`
      : undefined;
  const containerClass = cn(
    "relative shrink-0 overflow-hidden border border-border",
    isCircle && "rounded-full",
    shape === "square" && (borderRadiusPx == null || borderRadiusPx === 0) && "rounded-none",
    sizePx == null && "h-24 w-24 sm:h-32 sm:w-32",
    borderPx == null && "border-2"
  );
  if (hasError) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted", containerClass)}
        style={Object.keys(style).length ? style : undefined}
      >
        <User className="text-muted-foreground h-12 w-12 sm:h-16 sm:w-16" />
      </div>
    );
  }
  return (
    <div
      className={containerClass}
      style={Object.keys(style).length ? style : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
        sizes={sizePx != null ? `${sizePx}px` : "128px"}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function HeroSection() {
  const preview = useAboutPreview();
  const hero = preview?.hero ?? getHero();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
            <div className="order-2 sm:order-1 flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {hero.name}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {hero.subtitle}
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {hero.description}
              </p>
            </div>
            {hero.image && (
              <div className={cn("order-1 sm:order-2", "flex justify-center")}>
                <HeroImage
                  src={hero.image}
                  alt={hero.imageAlt ?? hero.name}
                  sizePx={hero.imageSizePx}
                  borderPx={hero.imageBorderPx}
                  shape={hero.imageShape}
                  borderRadiusPx={hero.imageBorderRadiusPx}
                  positionXPercent={hero.imagePositionXPercent}
                  positionYPercent={hero.imagePositionYPercent}
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
