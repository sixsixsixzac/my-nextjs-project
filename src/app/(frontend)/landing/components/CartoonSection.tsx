import type { SearchParams } from "@/lib/types/search";
import { searchCartoons } from "@/lib/api/search";
import { CartoonSectionClient } from "../components/CartoonSectionClient";

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
 * Uses client wrapper with RxJS viewport detection to pause/resume fetching.
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
    <CartoonSectionClient
      title={title}
      subtitle={subtitle}
      initialData={response.data}
      fetchMore={searchCartoons}
      fetchParams={fetchParams}
      limit={limit}
      initialHasMore={response.hasMore}
      className={className}
      moreHref={moreHref}
    />
  );
}

