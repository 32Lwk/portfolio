"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

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
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => {
          setHasError(true);
          setImageSrc(undefined);
        }}
        unoptimized={imageSrc.startsWith("http")}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        setHasError(true);
        setImageSrc(undefined);
      }}
      unoptimized={imageSrc.startsWith("http")}
    />
  );
}
