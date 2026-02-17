"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  aspectRatio,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const containerClass = aspectRatio
      ? `relative w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ${aspectRatio}`
      : "h-48 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center";
    return (
      <div className={containerClass}>
        <span className="text-muted-foreground">画像準備中</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? "(max-width: 768px) 100vw, 1200px"}
        priority={priority}
        quality={85}
        onError={() => {
          setHasError(true);
        }}
        unoptimized={src.startsWith("http://") || src.startsWith("https://")}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={85}
      onError={() => {
        setHasError(true);
      }}
      unoptimized={src.startsWith("http://") || src.startsWith("https://")}
    />
  );
}
