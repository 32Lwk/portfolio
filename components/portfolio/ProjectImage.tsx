"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ProjectImageProps {
  src?: string;
  alt: string;
}

export function ProjectImage({ src, alt }: ProjectImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);

  useEffect(() => {
    if (src) {
      const img = new window.Image();
      img.onerror = () => {
        setHasError(true);
        setImageSrc(undefined);
      };
      img.onload = () => {
        setHasError(false);
        setImageSrc(src);
      };
      img.src = src;
    } else {
      setHasError(true);
      setImageSrc(undefined);
    }
  }, [src]);

  if (!imageSrc || hasError) {
    return (
      <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">画像準備中</span>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-full overflow-hidden bg-muted group">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => {
          setHasError(true);
          setImageSrc(undefined);
        }}
        unoptimized={imageSrc.startsWith("http")}
      />
    </div>
  );
}
