import type { SearchFilters } from "@/lib/types/search";
import { searchCartoons } from "@/lib/api/search";
import { CartoonCarousel } from "@/components/common/CartoonCarousel";
import { buildSearchHref, buildSearchUrlParams } from "@/lib/utils/search-params";
import { LazyCartoonCarouselClient } from "./LazyCartoonCarouselClient";

interface CartoonCarouselWrapperProps {
    title?: string;
    /** Optional filters for which cartoons to load */
    filters?: SearchFilters;
    /** Number of items to fetch on first load (SSR) */
    limit?: number;
    /** Optional className for the outer wrapper */
    className?: string;
    /** Mark the first item in this carousel as high-priority for image loading (better LCP) */
    priorityFirst?: boolean;
    /** If true, lazy load the carousel when it scrolls into view (client-side) */
    lazy?: boolean;
}

/**
 * Unified carousel wrapper component that supports both SSR and lazy loading.
 * - When lazy=false (default): Fetches initial cartoons on the server for SSR.
 * - When lazy=true: Renders a client component that lazy loads when scrolled into view.
 * - Hydrates into a client component that can fetch more cartoons via CSR.
 */
export async function CartoonCarouselWrapper({
    title,
    filters,
    // Fetch a moderate number of items to balance UX and performance
    limit = 8,
    className,
    priorityFirst = false,
    lazy = false,
}: CartoonCarouselWrapperProps) {
    // If lazy, render the client component
    if (lazy) {
        return (
            <LazyCartoonCarouselClient
                title={title}
                filters={filters}
                className={className}
                limit={limit}
            />
        );
    }

    // Server-side rendering path
    // Handle database errors gracefully during build time or during navigation transitions
    let initial;
    try {
        initial = await searchCartoons({
            page: 1,
            limit,
            ...(filters ?? {}),
        });
    } catch (error) {
        // During build time, database unavailability, or navigation transitions (like logout),
        // return null silently to avoid source map issues in development
        // The component is designed to fail gracefully
        return null;
    }

    // Continue to render even if empty - let CartoonCarousel handle the empty state

    const searchHref = buildSearchHref(filters);

    const items = priorityFirst
        ? initial.data.map((item, index) =>
            index === 0 ? { ...item, priority: true } : item
        )
        : initial.data;

    // Lightweight, SEO-friendly JSON-LD for this carousel (one script per carousel instead of per-card)
    const schemaOrg = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        itemListElement: items.map((item, index) => ({
            "@type": "ComicSeries",
            position: index + 1,
            "@id": `https://pekotoon.com/cartoon/${item.uuid}`,
            name: item.title,
            image: item.coverImage,
            author: {
                "@type": "Person",
                name: item.author.name,
                image: item.author.avatar,
            },
            genre: item.genres,
        })),
    };

    return (
        <>
            <CartoonCarousel
                title={title}
                items={items}
                className={className}
                totalItems={20}
                searchHref={searchHref}
            />
            {items.length > 0 && (
                <script
                    type="application/ld+json"
                    // This runs only on the server and is emitted once per carousel
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
                />
            )}
        </>
    );
}
