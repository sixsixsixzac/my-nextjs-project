"use client";

import { useEffect, useMemo, useState, useCallback, Suspense, useRef } from "react";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import {
  searchCartoons,
  type SearchFilters as SearchFiltersType,
  type SearchResponse,
} from "@/lib/api/mockSearchApi";
import { CartoonCardProps } from "@/components/CartoonCard";
import { useSearchParams } from "next/navigation";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<CartoonCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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

  // RxJS subjects for filters
  const name$ = useMemo(() => new BehaviorSubject<string>(""), []);
  
  // Filters subject that emits the entire filter object
  const filtersSubject$ = useMemo(
    () => new BehaviorSubject<SearchFiltersType>(filters),
    []
  );

  // Scroll trigger subject for infinite scroll
  const scrollTrigger$ = useMemo(
    () => new BehaviorSubject<number>(1),
    []
  );

  // Debounced name stream
  const debouncedName$ = useMemo(
    () => name$.pipe(debounceTime(300), distinctUntilChanged()),
    [name$]
  );

  // Combined filters stream with debounced name
  const filters$ = useMemo(
    () =>
      combineLatest([
        debouncedName$,
        filtersSubject$,
      ]).pipe(
        map(([name, currentFilters]) => ({
          ...currentFilters,
          name: name || undefined,
        }))
      ),
    [debouncedName$, filtersSubject$]
  );

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);
  
  // Merge filters with scroll trigger and reset pagination when filters change
  const searchParams$ = useMemo(
    () =>
      combineLatest([filters$, scrollTrigger$]).pipe(
        switchMap(([filterParams, page]) => {
          const filterKey = JSON.stringify(filterParams);
          const filtersChanged = prevFiltersRef.current !== filterKey && !isInitialLoadRef.current;
          
          // Update previous filters
          prevFiltersRef.current = filterKey;
          
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
      ),
    [filters$, scrollTrigger$]
  );

  // Subscribe to search results
  useEffect(() => {
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
      error: (error) => {
        console.error("Search error:", error);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [searchParams$]);
  
  // Initial load on mount
  useEffect(() => {
    setIsLoading(true);
    // Trigger initial search by emitting filter values
    name$.next(filters.name || "");
    filtersSubject$.next(filters);
    scrollTrigger$.next(1);
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: SearchFiltersType) => {
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
    if (!isLoading && hasMore) {
      setIsLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollTrigger$.next(nextPage);
    }
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

      <SearchResults
        items={results}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
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

