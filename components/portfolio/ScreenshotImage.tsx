"use client";

import Image from "next/image";
import { useState } from "react";

interface ScreenshotImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

export function ScreenshotImage({ src, alt, className, sizes }: ScreenshotImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-muted">
        <span className="text-muted-foreground text-sm">画像準備中</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes ?? "(max-width: 768px) 100vw, 600px"}
      onError={() => setHasError(true)}
    />
  );
}
