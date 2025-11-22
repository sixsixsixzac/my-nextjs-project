"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartoonCard, type CartoonCardProps } from "../../../../components/common/CartoonCard";
import { CartoonCardSkeleton } from "../../../../components/common/CartoonCardSkeleton";
import { cn } from "@/lib/utils";
import type { SearchParams, SearchResponse } from "@/lib/types/search";

interface CartoonScrollerProps {
  initialData: CartoonCardProps[];
  fetchMore: (params: SearchParams) => Promise<SearchResponse>;
  fetchParams?: Omit<SearchParams, "page" | "limit">;
  limit?: number;
  initialHasMore?: boolean;
  isInViewport?: boolean;
}

/**
 * CartoonScroller - Client Component
 * 
 * Custom horizontal scroller with:
 * - CSS scroll-snap for smooth snapping
 * - Mobile: 2.5 items per view, swipe/drag scroll
 * - Desktop: 6 items per view, Prev/Next buttons
 * - Infinite scroll with intersection observer
 * - Performance optimized with memoization
 */
export function CartoonScroller({
  initialData,
  fetchMore,
  fetchParams = {},
  limit = 20,
  initialHasMore = true,
  isInViewport = true,
}: CartoonScrollerProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Maximum items limit: 24 for desktop (6 × 4), 25 for mobile (2.5 × 10)
  // Limit initial data based on current viewport (will update on resize)
  const getMaxLimit = () => (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 24 : 25;
  const [cartoons, setCartoons] = useState<CartoonCardProps[]>(() => {
    const maxLimit = getMaxLimit();
    return initialData.slice(0, maxLimit);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    const maxLimit = getMaxLimit();
    return initialHasMore && initialData.length < maxLimit;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const scrollCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Check if desktop on mount and resize with debouncing
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    
    const checkIsDesktop = () => {
      const newIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(newIsDesktop);
      
      // Update cartoons limit when viewport changes
      const newMaxLimit = newIsDesktop ? 24 : 25;
      setCartoons((prev) => {
        const limited = prev.length > newMaxLimit ? prev.slice(0, newMaxLimit) : prev;
        // Update hasMore based on limited length
        setHasMore((prevHasMore) => prevHasMore && limited.length < newMaxLimit);
        return limited;
      });
    };
    
    // Debounced resize handler to reduce main thread work
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        checkIsDesktop();
      }, 150); // 150ms debounce
    };
    
    checkIsDesktop();
    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  // Check scroll position and update button states
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (scrollCheckTimeoutRef.current) {
      clearTimeout(scrollCheckTimeoutRef.current);
    }
    scrollCheckTimeoutRef.current = setTimeout(() => {
      checkScrollPosition();
    }, 100);
  }, [checkScrollPosition]);

  // Load more cartoons when reaching the end
  const loadMoreCartoons = useCallback(async () => {
    if (isLoading || !hasMore || !isInViewport) return;

    const currentMaxLimit = isDesktop ? 24 : 25;
    if (cartoons.length >= currentMaxLimit) {
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    const nextPage = currentPage + 1;

    try {
      const response: SearchResponse = await fetchMore({
        ...fetchParams,
        page: nextPage,
        limit,
      });

      const updatedMaxLimit = isDesktop ? 24 : 25;

      if (response.data.length > 0) {
        setCartoons((prevCartoons) => {
          const newCartoons = [...prevCartoons, ...response.data];
          const limitedCartoons = newCartoons.slice(0, updatedMaxLimit);
          setHasMore(limitedCartoons.length < updatedMaxLimit && response.hasMore);
          return limitedCartoons;
        });
        setCurrentPage((prevPage) => prevPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more cartoons:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    cartoons.length,
    currentPage,
    fetchMore,
    fetchParams,
    hasMore,
    isDesktop,
    isInViewport,
    isLoading,
    limit,
  ]);

  // Intersection Observer for infinite scroll (only triggers if in viewport)
  useEffect(() => {
    // Don't observe if not in viewport
    if (!isInViewport) return;

    const currentMaxLimit = isDesktop ? 24 : 25;
    // Don't observe if we've reached the limit
    if (cartoons.length >= currentMaxLimit) {
      setHasMore(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isLoading && isInViewport) {
          loadMoreCartoons();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const trigger = loadMoreTriggerRef.current;
    if (trigger) {
      observer.observe(trigger);
    }

    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, [hasMore, isLoading, loadMoreCartoons, cartoons.length, isDesktop, isInViewport]);

  // Initial scroll position check and scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollCheckTimeoutRef.current) {
        clearTimeout(scrollCheckTimeoutRef.current);
      }
    };
  }, [handleScroll, checkScrollPosition, cartoons.length]);

  // Scroll navigation handlers
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll by exactly one page (container's visible width)
    // This ensures we scroll by exactly the number of items visible
    const scrollDistance = container.clientWidth;
    
    container.scrollBy({
      left: -scrollDistance,
      behavior: "smooth",
    });
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll by exactly one page (container's visible width)
    // This ensures we scroll by exactly the number of items visible
    const scrollDistance = container.clientWidth;
    
    container.scrollBy({
      left: scrollDistance,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative">
      {/* Desktop Navigation Buttons */}
      <div className="absolute left-0 top-1/2 z-10 hidden -translate-x-4 -translate-y-1/2 md:block lg:-translate-x-6">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full bg-background/90 shadow-lg hover:bg-background lg:h-12 lg:w-12",
            canScrollLeft && "cursor-pointer"
          )}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
      </div>

      <div className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-4 md:block lg:translate-x-6">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full bg-background/90 shadow-lg hover:bg-background lg:h-12 lg:w-12",
            canScrollRight && "cursor-pointer"
          )}
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex gap-4 overflow-x-auto overflow-y-hidden",
          "scroll-smooth",
          // Mobile: 2.5 items per view
          "snap-x snap-mandatory",
          // Smooth momentum scrolling
          "overscroll-x-contain",
          // Padding for mobile scroll indicator
          "pb-2 md:pb-0",
          // Prevent layout shift
          "min-h-[400px] md:min-h-[500px]",
          // Hide scrollbar but keep functionality
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {cartoons.map((cartoon, index) => (
          <div
            key={cartoon.uuid}
            className={cn(
              "flex-shrink-0 snap-start",
              // Mobile: 2.5 items per view
              // Formula: (100% - (n-1) * gap) / n where n = 2.5
              // For 2.5 items with 1 gap: (100% - 1rem) / 2.5 = 40% - 0.4rem
              "w-[calc((100%-1rem)/2.5)]",
              // Tablet: 3 items per view
              // (100% - 2 * 1rem) / 3 = (100% - 2rem) / 3
              "md:w-[calc((100%-2rem)/3)]",
              // Desktop: 6 items per view
              // (100% - 5 * 1rem) / 6 = (100% - 5rem) / 6
              "lg:w-[calc((100%-5rem)/6)]"
            )}
          >
            <CartoonCard
              {...cartoon}
              priority={index === 0}
            />
          </div>
        ))}

        {/* Load More Trigger (invisible) */}
        {hasMore && !isLoading && (
          <div
            ref={loadMoreTriggerRef}
            className="flex-shrink-0 w-1 h-full"
            aria-hidden="true"
          />
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <>
            {Array.from({ length: isDesktop ? 6 : 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className={cn(
                  "flex-shrink-0 snap-start",
                  // Mobile: 2.5 items per view
                  "w-[calc((100%-1rem)/2.5)]",
                  // Tablet: 3 items per view
                  "md:w-[calc((100%-2rem)/3)]",
                  // Desktop: 6 items per view
                  "lg:w-[calc((100%-5rem)/6)]"
                )}
              >
                <CartoonCardSkeleton />
              </div>
            ))}
            {/* Load More Trigger for when loading */}
            {hasMore && (
              <div
                ref={loadMoreTriggerRef}
                className="flex-shrink-0 w-1 h-full"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

