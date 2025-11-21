import { CartoonScroller } from "./CartoonScroller";
import type { CartoonCardProps } from "./CartoonCard";
import type { SearchParams, SearchResponse } from "@/lib/types/search";
import { searchCartoons } from "@/lib/api/search";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CartoonSectionProps {
  title: string;
  subtitle?: string;
  cartoonType: "manga" | "novel";
  orderBy: "relevance" | "views" | "likes" | "latest" | "chapters" | "latest_update";
  page?: number;
  limit?: number;
  className?: string;
  moreHref?: string;
}

/**
 * CartoonSection - Server Component
 * 
 * SSR-optimized section component for displaying cartoons in a horizontal scroller.
 * Handles initial data loading on the server for SEO and fast LCP.
 */
export async function CartoonSection({
  title,
  subtitle,
  cartoonType,
  orderBy,
  page = 1,
  limit = 6,
  className,
  moreHref,
}: CartoonSectionProps) {
  // Fetch initial data on the server
  const response = await searchCartoons({
    cartoonType,
    orderBy,
    page,
    limit,
  });

  const fetchParams: Omit<SearchParams, "page" | "limit"> = {
    cartoonType,
    orderBy,
  };

  return (
    <section className={className} aria-labelledby={`cartoon-section-${title}`}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2
            id={`cartoon-section-${title}`}
            className="text-xl font-bold text-foreground md:text-2xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {moreHref && (
          <div className="flex-shrink-0">
            <Button asChild variant="ghost" size="sm">
              <Link href={moreHref}>เพิ่มเติม</Link>
            </Button>
          </div>
        )}
      </div>
      {response.data.length > 0 && (
        <CartoonScroller
          initialData={response.data}
          fetchMore={searchCartoons}
          fetchParams={fetchParams}
          limit={limit}
          initialHasMore={response.hasMore}
        />
      )}
    </section>
  );
}

