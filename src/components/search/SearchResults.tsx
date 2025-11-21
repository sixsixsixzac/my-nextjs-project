"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CartoonCard, type CartoonCardProps } from "@/components/CartoonCard";
import { CartoonCardSkeleton } from "@/components/CartoonCardSkeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  items: CartoonCardProps[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
}

export function SearchResults({
  items,
  isLoading,
  hasMore,
  onLoadMore,
  className,
}: SearchResultsProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: "100px", // Trigger 100px before reaching the bottom
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <Empty className={cn("min-h-[400px]", className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search className="size-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>ไม่พบผลลัพธ์</EmptyTitle>
          <EmptyDescription>
            ลองเปลี่ยนคำค้นหาหรือตัวกรองเพื่อดูผลลัพธ์อื่นๆ
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <CartoonCard key={item.uuid} {...item} />
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <CartoonCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && !isLoading && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* End of results */}
      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          แสดงผลลัพธ์ทั้งหมดแล้ว
        </div>
      )}
    </div>
  );
}

