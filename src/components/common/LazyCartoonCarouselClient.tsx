"use client";

import { useEffect, useRef, useState } from "react";
import { CartoonCarousel } from "@/components/common/CartoonCarousel";
import type { SearchFilters, SearchResponse } from "@/lib/types/search";
import type { CartoonCardProps } from "@/components/common/CartoonCard";
import { fetchService } from "@/lib/services/fetch-service";
import { buildSearchHref, buildSearchUrlParams } from "@/lib/utils/search-params";

interface LazyCartoonCarouselClientProps {
  title?: string;
  filters?: SearchFilters;
  className?: string;
  /** Match server carousel default */
  limit?: number;
}

/**
 * Client-side lazy loaded carousel component:
 * - Renders only after it scrolls into view (IntersectionObserver).
 * - Fetches data from /api/cartoon/search to avoid SSR cost.
 * - Helps reduce initial LCP/TBT by not rendering all carousels on first paint.
 */
export function LazyCartoonCarouselClient({
  title,
  filters,
  className,
  limit = 8,
}: LazyCartoonCarouselClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<CartoonCardProps[] | null>(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchHref = buildSearchHref(filters);

  useEffect(() => {
    if (!containerRef.current || hasRequested) return;

    const target = containerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || hasRequested) return;

        setHasRequested(true);
        setIsLoading(true);

        const params = buildSearchUrlParams(filters);
        params.set("page", "1");
        params.set("limit", String(limit));

        void (async () => {
          try {
            const data = await fetchService.get<SearchResponse>(`/api/cartoon/search?${params.toString()}`);
            setItems(data.data);
          } catch (error) {
            // Silently fail - don't show error for lazy loading
            console.error("Failed to load carousel items:", error);
          } finally {
            setIsLoading(false);
          }
        })();
      },
      {
        root: null,
        rootMargin: "200px 0px", // start loading a bit before it comes into view
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [filters, hasRequested, limit]);

  return (
    <div ref={containerRef} className={className}>
      {items !== null ? (
        // Items have been loaded - CartoonCarousel will handle empty state
        <CartoonCarousel
          title={title}
          items={items}
          className=""
          totalItems={20}
          searchHref={searchHref}
        />
      ) : (
        // Still loading or not yet requested - show loading placeholder
        <section aria-label={title}>
          {title && (
            <header className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
                {title}
              </h2>
            </header>
          )}
          {isLoading && (
            <div className="h-40 w-full rounded-lg bg-muted/40 animate-pulse" />
          )}
        </section>
      )}
    </div>
  );
}
