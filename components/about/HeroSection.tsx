"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getHero } from "@/lib/hero";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-muted sm:h-32 sm:w-32">
        <User className="text-muted-foreground h-12 w-12 sm:h-16 sm:w-16" />
      </div>
    );
  }
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 sm:h-32 sm:w-32">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="128px"
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
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
