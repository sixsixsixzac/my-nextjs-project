"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getBlurDataURL } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  fallbackText?: string;
  itemProp?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className,
  priority = false,
  quality = 85,
  fallbackText,
  itemProp,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isDicebearImage = src?.includes("api.dicebear.com");

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
    onError?.();
  };

  const imageProps = {
    src,
    alt,
    className: cn(
      "object-cover transition-opacity duration-500",
      imageLoaded ? "opacity-100" : "opacity-0",
      className
    ),
    loading: priority ? ("eager" as const) : ("lazy" as const),
    priority,
    fetchPriority: priority ? ("high" as const) : ("auto" as const),
    quality,
    placeholder: "blur" as const,
    blurDataURL: getBlurDataURL(),
    unoptimized: isDicebearImage,
    onLoad: handleLoad,
    onError: handleError,
    ...(itemProp && { itemProp }),
    ...(sizes && { sizes }),
  };

  // Error fallback UI
  if (imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <div className="text-center p-4">
          <BookOpen className="size-12 mx-auto text-muted-foreground/50 mb-2" />
          {fallbackText && (
            <p className="text-xs text-muted-foreground/70">{fallbackText}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {fill ? (
        <Image fill {...imageProps} />
      ) : (
        <Image width={width} height={height} {...imageProps} />
      )}
      {/* Blurred overlay that fades out when image loads */}
      {!imageError && (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500 pointer-events-none",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{
            backgroundImage: `url(${src})`,
            filter: "blur(20px)",
            transform: "scale(1.1)", // Slight scale to hide blur edges
          }}
        />
      )}
    </>
  );
}

