"use client";

import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getBio } from "@/lib/bio";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function BioBlockImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="relative my-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
        <ImageIcon className="text-muted-foreground h-12 w-12" />
      </div>
    );
  }
  return (
    <div className="relative my-4 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 672px"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function BioSection() {
  const preview = useAboutPreview();
  const bio = preview?.bio ?? getBio();
  if (!bio.blocks || bio.blocks.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-6 text-3xl font-bold">自己紹介</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {bio.blocks.map((block, index) =>
            block.type === "text" ? (
              <p
                key={index}
                className={cn("text-lg leading-8", index > 0 && "mt-4")}
              >
                {block.content}
              </p>
            ) : block.type === "image" ? (
              <BioBlockImage
                key={index}
                src={block.src}
                alt={block.alt}
              />
            ) : null
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
