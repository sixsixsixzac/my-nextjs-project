"use client";

import { useEffect, useMemo, useState, useCallback, Suspense, useRef } from "react";
import { SearchFilters } from "@/app/(frontend)/search/filter";
import { SearchResults } from "@/components/search/SearchResults";
import { searchCartoons } from "@/lib/api/search";
import type { SearchFilters as SearchFiltersType, SearchResponse } from "@/lib/types/search";
import { CartoonCardProps } from "@/components/CartoonCard";
import { useSearchParams } from "next/navigation";

// Lazy load RxJS to reduce initial bundle size and main thread work
const loadRxJS = () => import("rxjs").then((rxjs) => ({
  BehaviorSubject: rxjs.BehaviorSubject,
  combineLatest: rxjs.combineLatest,
  debounceTime: rxjs.debounceTime,
  distinctUntilChanged: rxjs.distinctUntilChanged,
  map: rxjs.map,
  switchMap: rxjs.switchMap,
}));

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<CartoonCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rxjsLoaded, setRxjsLoaded] = useState(false);
  const rxjsRef = useRef<Awaited<ReturnType<typeof loadRxJS>> | null>(null);

  // Lazy load RxJS on mount
  useEffect(() => {
    loadRxJS().then((rxjs) => {
      rxjsRef.current = rxjs;
      setRxjsLoaded(true);
    });
  }, []);

  // Scroll to top when component mounts or search params change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams.toString()]);
  
  // Initialize filters from URL params
  const initialFilters = useMemo<SearchFiltersType>(() => ({
    name: searchParams.get("name") || undefined,
    complete_status: (searchParams.get("complete_status") as "all" | "completed" | "ongoing") || "all",
    cartoonType: (searchParams.get("cartoonType") as "all" | "manga" | "novel") || "all",
    orderBy: (searchParams.get("orderBy") as "relevance" | "views" | "likes" | "latest" | "chapters" | "latest_update") || "latest_update",
    mainCategory: searchParams.get("mainCategory") || "all",
    subCategory: searchParams.get("subCategory") || "all",
    age: (searchParams.get("age") as "all" | "all_ages" | "teen" | "mature") || "all",
    original: (searchParams.get("original") as "all" | "original" | "adaptation") || "all",
  }), [searchParams]);
  
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);

  // Sync filters with URL params when they change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // RxJS subjects for filters - only create after RxJS is loaded, use refs to persist
  const name$Ref = useRef<any>(null);
  const filtersSubject$Ref = useRef<any>(null);
  const scrollTrigger$Ref = useRef<any>(null);

  // Initialize subjects once when RxJS loads
  useEffect(() => {
    if (rxjsLoaded && rxjsRef.current && !name$Ref.current) {
      name$Ref.current = new rxjsRef.current.BehaviorSubject<string>("");
      filtersSubject$Ref.current = new rxjsRef.current.BehaviorSubject<SearchFiltersType>(filters);
      scrollTrigger$Ref.current = new rxjsRef.current.BehaviorSubject<number>(1);
    }
  }, [rxjsLoaded, filters]);

  const name$ = name$Ref.current;
  const filtersSubject$ = filtersSubject$Ref.current;
  const scrollTrigger$ = scrollTrigger$Ref.current;

  // Debounced name stream
  const debouncedName$ = useMemo(() => {
    if (!name$ || !rxjsRef.current) return null;
    return name$.pipe(
      rxjsRef.current.debounceTime(300),
      rxjsRef.current.distinctUntilChanged()
    );
  }, [name$, rxjsLoaded]);

  // Combined filters stream with debounced name
  const filters$ = useMemo(() => {
    if (!debouncedName$ || !filtersSubject$ || !rxjsRef.current) return null;
    return (rxjsRef.current.combineLatest([
      debouncedName$,
      filtersSubject$,
    ]) as any).pipe(
      rxjsRef.current.map((values: [string, SearchFiltersType]) => {
        const [name, currentFilters] = values;
        return {
          ...currentFilters,
          name: name || undefined,
        };
      })
    );
  }, [debouncedName$, filtersSubject$, rxjsLoaded]);

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);
  
  // Merge filters with scroll trigger and reset pagination when filters change
  const searchParams$ = useMemo(() => {
    if (!filters$ || !scrollTrigger$ || !rxjsRef.current) return null;
    return (rxjsRef.current.combineLatest([filters$, scrollTrigger$]) as any).pipe(
      rxjsRef.current.switchMap((values: [SearchFiltersType, number]) => {
        const [filterParams, page] = values;
        const filterKey = JSON.stringify(filterParams);
        const filtersChanged = prevFiltersRef.current !== filterKey && !isInitialLoadRef.current;
        
        // Update previous filters
        prevFiltersRef.current = filterKey;
        console.log("Filter params:", filterParams);
        // On initial load or filter change, always use page 1
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          return searchCartoons({
            ...filterParams,
            page: 1,
            limit: 20,
          });
        }
        
        if (filtersChanged) {
          // Filters changed - reset to page 1
          return searchCartoons({
            ...filterParams,
            page: 1,
            limit: 20,
          });
        }

        // Load more - use the page from scroll trigger
        return searchCartoons({
          ...filterParams,
          page: page,
          limit: 20,
        });
      })
    );
  }, [filters$, scrollTrigger$, rxjsLoaded]);

  // Subscribe to search results
  useEffect(() => {
    if (!searchParams$) return;
    
    const subscription = searchParams$.subscribe({
      next: (response: SearchResponse) => {
        if (response.page === 1) {
          // New search - replace results
          setResults(response.data);
        } else {
          // Load more - append results
          setResults((prev) => [...prev, ...response.data]);
        }
        setHasMore(response.hasMore);
        setTotal(response.total);
        setCurrentPage(response.page);
        setIsLoading(false);
      },
      error: (error: unknown) => {
        console.error("Search error:", error);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [searchParams$]);
  
  // Initial load on mount - wait for RxJS to load
  useEffect(() => {
    if (!rxjsLoaded || !name$ || !filtersSubject$ || !scrollTrigger$) return;
    
    setIsLoading(true);
    // Trigger initial search by emitting filter values
    name$.next(filters.name || "");
    filtersSubject$.next(filters);
    scrollTrigger$.next(1);
  }, [rxjsLoaded, name$, filtersSubject$, scrollTrigger$, filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: SearchFiltersType) => {
      if (!name$ || !filtersSubject$ || !scrollTrigger$) return;
      
      setFilters(newFilters);
      setIsLoading(true);

      // Update name subject for debouncing
      name$.next(newFilters.name || "");
      
      // Update filters subject with all filter values
      filtersSubject$.next(newFilters);

      // Reset pagination when filters change
      setCurrentPage(1);
      // Reset scroll trigger to 1 to trigger filter change detection
      scrollTrigger$.next(1);
    },
    [name$, filtersSubject$, scrollTrigger$]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!scrollTrigger$ || isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    scrollTrigger$.next(nextPage);
  }, [isLoading, hasMore, currentPage, scrollTrigger$]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">ค้นหามังงะ</h1>
      </div>

      <SearchFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        onClearFilters={() => {
          setFilters({
            name: "",
            cartoonType: "all",
            orderBy: "latest_update",
            complete_status: "all",
            mainCategory: "all",
            subCategory: "all",
            age: "all",
            original: "all",
          });
        }}
      />

      {total > 0 && (
        <div className="text-sm text-muted-foreground">
          พบ {total} รายการ
        </div>
      )}

      {!rxjsLoaded ? (
        <div className="text-center py-12 text-muted-foreground">
          กำลังโหลด...
        </div>
      ) : (
        <SearchResults
          items={results}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">ค้นหามังงะ</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          กำลังโหลด...
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

