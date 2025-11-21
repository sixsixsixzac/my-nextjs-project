"use server";

import { prisma } from "@/lib/prisma";
import type { SearchParams, SearchResponse } from "@/lib/types/search";
import type { CartoonCardProps } from "@/components/CartoonCard";
import { Prisma } from "@prisma/client";

// Type for cartoon query result
type CartoonQueryResult = {
  uuid: string | null;
  title: string;
  coverImage: string;
  type: "manga" | "novel";
  completionStatus: number;
  createdAt: Date | null;
  categoryMain: number | null;
  categorySub: number | null;
  ageRate: string | null;
  author: {
    displayName: string;
    userImg: string | null;
    level: number;
  };
  _count: {
    episodeViews: number;
    favorites: number;
    episodes: number;
  };
};

// Type for raw SQL result
type RawSQLResult = {
  p_id: bigint | number;
  uuid: string;
};

/**
 * Builds Prisma where clause from search parameters
 */
function buildWhereClause(params: {
  name?: string;
  cartoonType?: string;
  complete_status?: string;
  age?: string;
  original?: string;
  mainCategory?: string;
  subCategory?: string;
}): Prisma.CartoonWhereInput {
  const where: Prisma.CartoonWhereInput = {
    status: "active",
    publishStatus: 1,
  };

  if (params.name) {
    where.title = { contains: params.name };
  }

  if (params.cartoonType && params.cartoonType !== "all") {
    where.type = params.cartoonType as "manga" | "novel";
  }

  if (params.complete_status && params.complete_status !== "all") {
    where.completionStatus = params.complete_status === "completed" ? 1 : 0;
  }

  if (params.age && params.age !== "all") {
    where.ageRate = params.age === "all_ages" ? "all" : params.age;
  }

  if (params.original && params.original !== "all") {
    where.originType = params.original === "original" ? 1 : 2;
  }

  if (params.mainCategory && params.mainCategory !== "all") {
    where.categoryMain = parseInt(params.mainCategory, 10);
  }

  if (params.subCategory && params.subCategory !== "all") {
    where.categorySub = parseInt(params.subCategory, 10);
  }

  return where;
}

/**
 * Builds SQL WHERE conditions and parameters for raw queries
 */
function buildSQLWhereClause(params: {
  name?: string;
  cartoonType?: string;
  complete_status?: string;
  age?: string;
  original?: string;
  mainCategory?: string;
  subCategory?: string;
}): { conditions: string[]; sqlParams: unknown[] } {
  const conditions: string[] = ["c.status = 'active'", "c.publish_status = 1"];
  const sqlParams: unknown[] = [];

  if (params.name) {
    conditions.push("c.title LIKE ?");
    sqlParams.push(`%${params.name}%`);
  }

  if (params.cartoonType && params.cartoonType !== "all") {
    conditions.push("c.type = ?");
    sqlParams.push(params.cartoonType);
  }

  if (params.complete_status && params.complete_status !== "all") {
    conditions.push("c.completion_status = ?");
    sqlParams.push(params.complete_status === "completed" ? 1 : 0);
  }

  if (params.age && params.age !== "all") {
    conditions.push("c.age_rate = ?");
    sqlParams.push(params.age === "all_ages" ? "all" : params.age);
  }

  if (params.original && params.original !== "all") {
    conditions.push("c.origin_type = ?");
    sqlParams.push(params.original === "original" ? 1 : 2);
  }

  if (params.mainCategory && params.mainCategory !== "all") {
    conditions.push("c.category_main = ?");
    sqlParams.push(parseInt(params.mainCategory, 10));
  }

  if (params.subCategory && params.subCategory !== "all") {
    conditions.push("c.category_sub = ?");
    sqlParams.push(parseInt(params.subCategory, 10));
  }

  return { conditions, sqlParams };
}

/**
 * Gets order configuration for raw SQL queries
 */
function getOrderConfig(orderBy: string): {
  join: string;
  orderField: string;
  needsGroupBy: boolean;
} {
  switch (orderBy) {
    case "views":
      return {
        join: "LEFT JOIN manga_ep_views MEV ON MEV.p_id = c.p_id",
        orderField: "COUNT(MEV.id)",
        needsGroupBy: true,
      };
    case "likes":
      return {
        join: "LEFT JOIN manga_favorite MF ON MF.p_id = c.p_id",
        orderField: "COUNT(MF.id)",
        needsGroupBy: true,
      };
    case "chapters":
      return {
        join: "LEFT JOIN manga_ep ME ON ME.p_id = c.p_id AND ME.status = 'active' AND ME.publish_status = 'now'",
        orderField: "COUNT(ME.ep_id)",
        needsGroupBy: true,
      };
    case "latest_update":
      return {
        join: "LEFT JOIN manga_ep ME ON ME.p_id = c.p_id AND ME.status = 'active' AND ME.publish_status = 'now'",
        orderField: "MAX(ME.create_at)",
        needsGroupBy: true,
      };
    default:
      return {
        join: "",
        orderField: "c.created_at",
        needsGroupBy: false,
      };
  }
}

/**
 * Constructs image URL from path
 */
function constructImageUrl(path: string | null, defaultPath: string): string {
  if (!path) return defaultPath;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return defaultPath.includes("post_img") 
    ? `/images/post_img/${path}`
    : `/images/${path}`;
}

/**
 * Constructs author avatar URL
 */
function constructAuthorAvatarUrl(userImg: string | null): string | undefined {
  if (!userImg || userImg === "none.png") return undefined;
  if (userImg.startsWith("http://") || userImg.startsWith("https://")) {
    return userImg;
  }
  return `/images/${userImg}`;
}

/**
 * Search cartoons API
 * Fetches cartoons from database with filtering, sorting, and pagination
 * Server Action - can be passed to Client Components
 */
export async function searchCartoons(
  params: SearchParams
): Promise<SearchResponse> {
  const {
    page = 1,
    limit = 20,
    name,
    complete_status,
    cartoonType,
    orderBy = "latest",
    mainCategory,
    subCategory,
    age,
    original,
  } = params;

  const skip = (page - 1) * limit;
  const where = buildWhereClause({
    name,
    cartoonType,
    complete_status,
    age,
    original,
    mainCategory,
    subCategory,
  });

  // Calculate date threshold once
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Check if we need raw SQL for ordering
  const needsRawSQLOrder = ["views", "likes", "chapters", "latest_update"].includes(orderBy);
  
  let cartoons: CartoonQueryResult[];
  
  if (needsRawSQLOrder) {
    const { conditions, sqlParams } = buildSQLWhereClause({
      name,
      cartoonType,
      complete_status,
      age,
      original,
      mainCategory,
      subCategory,
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const { join, orderField, needsGroupBy } = getOrderConfig(orderBy);
    
    const groupByClause = needsGroupBy
      ? `GROUP BY c.p_id, c.uuid, c.title, c.cover_image, c.type, c.completion_status, 
               c.created_at, c.category_main, c.category_sub, c.age_rate`
      : "";

    // Build parameterized query to prevent SQL injection
    // Using $queryRawUnsafe with proper parameterization for dynamic queries
    const safeRawQuery = `
      SELECT c.p_id, c.uuid
      FROM cartoons c
      ${join}
      ${whereClause}
      ${groupByClause}
      ORDER BY ${orderField} DESC
      LIMIT ? OFFSET ?
    `;

    const safeRawResults = await prisma.$queryRawUnsafe<RawSQLResult[]>(
      safeRawQuery,
      ...sqlParams,
      limit + 1,
      skip
    );

    const pIds = safeRawResults.map((r) => Number(r.p_id));

    if (pIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    // Fetch full cartoon data with relations, maintaining order
    const fetchedCartoons = await prisma.cartoon.findMany({
      where: {
        ...where,
        pId: { in: pIds },
      },
      select: {
        pId: true,
        uuid: true,
        title: true,
        coverImage: true,
        type: true,
        completionStatus: true,
        createdAt: true,
        categoryMain: true,
        categorySub: true,
        ageRate: true,
        author: {
          select: {
            displayName: true,
            userImg: true,
            level: true,
          },
        },
        _count: {
          select: {
            episodeViews: true,
            favorites: true,
            episodes: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const cartoonsMap = new Map(
      fetchedCartoons.map((c) => [c.pId, c])
    );

    // Sort cartoons to match raw query order, filtering out any missing items
    cartoons = safeRawResults
      .map((r) => {
        const cartoon = cartoonsMap.get(Number(r.p_id));
        if (!cartoon) return null;
        // Remove pId from the result to match CartoonQueryResult type
        const { pId, ...rest } = cartoon;
        return rest as CartoonQueryResult;
      })
      .filter((c): c is CartoonQueryResult => c !== null);
  } else {
    // Standard Prisma query for simple ordering
    cartoons = await prisma.cartoon.findMany({
      where,
      skip,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      select: {
        uuid: true,
        title: true,
        coverImage: true,
        type: true,
        completionStatus: true,
        createdAt: true,
        categoryMain: true,
        categorySub: true,
        ageRate: true,
        author: {
          select: {
            displayName: true,
            userImg: true,
            level: true,
          },
        },
        _count: {
          select: {
            episodeViews: true,
            favorites: true,
            episodes: true,
          },
        },
      },
    });
  }

  const hasMore = cartoons.length > limit;
  const cartoonsToReturn = hasMore ? cartoons.slice(0, limit) : cartoons;

  // Collect unique category IDs efficiently
  const categoryIds = new Set<number>();
  for (const cartoon of cartoonsToReturn) {
    if (cartoon.categoryMain) categoryIds.add(cartoon.categoryMain);
    if (cartoon.categorySub) categoryIds.add(cartoon.categorySub);
  }

  // Fetch categories only if needed
  const categoryMap = new Map<number, string>();
  if (categoryIds.size > 0) {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: Array.from(categoryIds) },
        status: 1,
      },
      select: {
        id: true,
        categoryName: true,
      },
    });
    categories.forEach((cat) => categoryMap.set(cat.id, cat.categoryName));
  }

  // Transform to CartoonCardProps format
  const data: CartoonCardProps[] = cartoonsToReturn.map((cartoon) => {
    const genres: string[] = [];
    const mainCat = cartoon.categoryMain ? categoryMap.get(cartoon.categoryMain) : null;
    const subCat = cartoon.categorySub ? categoryMap.get(cartoon.categorySub) : null;
    if (mainCat) genres.push(mainCat);
    if (subCat) genres.push(subCat);

    return {
      uuid: cartoon.uuid?.toString() || "",
      title: cartoon.title,
      coverImage: constructImageUrl(cartoon.coverImage, "/images/post_img/default.png"),
      author: {
        name: cartoon.author.displayName,
        avatar: constructAuthorAvatarUrl(cartoon.author.userImg),
        verified: cartoon.author.level >= 2,
      },
      genres,
      views: cartoon._count.episodeViews,
      chapters: cartoon._count.episodes,
      likes: cartoon._count.favorites,
      isNew: cartoon.createdAt ? cartoon.createdAt > sevenDaysAgo : false,
      type: cartoon.type,
      complete_status: cartoon.completionStatus === 1 ? "completed" : "ongoing",
      ageRate: cartoon.ageRate || undefined,
    };
  });

  // Get total count for pagination (can be optimized further if not always needed)
  const total = await prisma.cartoon.count({ where });

  return {
    data,
    total,
    page,
    limit,
    hasMore,
  };
}

