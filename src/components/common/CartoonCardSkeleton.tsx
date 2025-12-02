import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Eye, Heart, BookOpen } from "lucide-react";

interface CartoonCardSkeletonProps {
  className?: string;
}

export function CartoonCardSkeleton({ className }: CartoonCardSkeletonProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card shadow-sm",
        className
      )}
    >
      {/* Cover Image Skeleton - matches CartoonCard dimensions */}
      <div className="relative mx-auto h-[250px] w-[180px] sm:w-[180px] overflow-hidden bg-muted">
        <Skeleton className="h-full w-full" />

        {/* Title Overlay Skeleton (for mobile/tablet) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 md:hidden">
          <Skeleton className="h-4 w-3/4 bg-white/20" />
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title Skeleton (Desktop) */}
        <div className="hidden md:block">
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Author Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="flex min-w-0 items-center gap-1.5">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Genres Skeleton */}
        <div className="flex flex-wrap gap-1.5 min-w-0">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Statistics Skeleton */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Eye className="size-3.5 shrink-0 text-muted-foreground/30" aria-hidden="true" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Heart className="size-3.5 shrink-0 text-muted-foreground/30" aria-hidden="true" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <BookOpen className="size-3.5 shrink-0 text-muted-foreground/30" aria-hidden="true" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
      </div>
    </article>
  );
}


