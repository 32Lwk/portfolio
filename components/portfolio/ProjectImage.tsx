"use client";

import Image from "next/image";
import { useState } from "react";

interface ProjectImageProps {
  src?: string;
  alt: string;
}

export function ProjectImage({ src, alt }: ProjectImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">画像準備中</span>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-full overflow-hidden bg-muted group">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
        quality={85}
        onError={() => {
          setHasError(true);
        }}
        unoptimized={src.startsWith("http://") || src.startsWith("https://")}
      />
    </div>
  );
}
