"use server";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

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

export interface CartoonDetailData {
  uuid: string;
  title: string;
  description: string;
  coverImage: string;
  type: "manga" | "novel";
  author: {
    display_name: string;
    uuid: string;
    avatar?: string;
    is_online?: boolean;
  };
  stats: {
    episodes: number;
    views: number;
    likes: number;
  };
  episodes: Array<{
    uuid: string;
    number: number;
    title: string;
    price: number;
    isOwned?: boolean;
    lockAfterDatetime?: Date | null;
  }>;
  genres: string[];
  complete_status: "completed" | "ongoing";
  ageRate?: string;
}

/**
 * Fetch cartoon detail by UUID and type
 */
export async function getCartoonByUuid(
  uuid: string,
  type: "manga" | "novel"
): Promise<CartoonDetailData> {
  const cartoon = await prisma.cartoon.findFirst({
    where: {
      uuid,
      type,
      status: "active",
      publishStatus: 1,
    },
    select: {
      pId: true,
      uuid: true,
      title: true,
      description: true,
      coverImage: true,
      type: true,
      completionStatus: true,
      ageRate: true,
      categoryMain: true,
      categorySub: true,
      author: {
        select: {
          uuid: true,
          displayName: true,
          userImg: true,
          level: true,
        },
      },
      _count: {
        select: {
          episodeViews: true,
          favorites: true,
          episodes: {
            where: {
              status: "active",
              publishStatus: "now",
            },
          },
        },
      },
      episodes: {
        where: {
          status: "active",
          publishStatus: "now",
        },
        select: {
          epId: true,
          uuid: true,
          epNo: true,
          epName: true,
          epPrice: true,
        },
        orderBy: {
          epNo: "asc",
        },
      },
    },
  });

  if (!cartoon || !cartoon.uuid) {
    notFound();
  }

  // Fetch categories
  const categoryIds = new Set<number>();
  if (cartoon.categoryMain) categoryIds.add(cartoon.categoryMain);
  if (cartoon.categorySub) categoryIds.add(cartoon.categorySub);

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

  const genres: string[] = [];
  const mainCat = cartoon.categoryMain ? categoryMap.get(cartoon.categoryMain) : null;
  const subCat = cartoon.categorySub ? categoryMap.get(cartoon.categorySub) : null;
  if (mainCat) genres.push(mainCat);
  if (subCat) genres.push(subCat);

  // Get current user to check episode ownership (including temporary ownership)
  const user = await getCurrentUser();
  let ownedEpisodeIds: Set<number> = new Set();
  const episodeLockAfterMap = new Map<number, Date | null>();
  
  if (user?.id) {
    const userId = parseInt(user.id);
    const now = new Date();
    const purchases = await prisma.epShop.findMany({
      where: {
        userId: userId,
        pId: cartoon.pId,
      },
      select: {
        epId: true,
        lockAfterDatetime: true,
      },
    });
    
    // Check if episode is owned (permanently or temporarily)
    purchases.forEach((purchase) => {
      if (purchase.epId !== null) {
        // Episode is owned if:
        // 1. lockAfterDatetime is null (permanent ownership), OR
        // 2. lockAfterDatetime is in the future (temporary ownership still valid)
        const isTemporarilyOwned = purchase.lockAfterDatetime === null || purchase.lockAfterDatetime > now;
        if (isTemporarilyOwned) {
          ownedEpisodeIds.add(purchase.epId);
          episodeLockAfterMap.set(purchase.epId, purchase.lockAfterDatetime);
        }
      }
    });
  }

  return {
    uuid: cartoon.uuid,
    title: cartoon.title,
    description: cartoon.description,
    coverImage: constructImageUrl(cartoon.coverImage, "/images/post_img/default.png"),
    type: cartoon.type,
    author: {
      display_name: cartoon.author.displayName,
      uuid: cartoon.author.uuid,
      avatar: constructAuthorAvatarUrl(cartoon.author.userImg),
      is_online: false, // TODO: Implement online status check
    },
    stats: {
      episodes: cartoon._count.episodes,
      views: cartoon._count.episodeViews,
      likes: cartoon._count.favorites,
    },
    episodes: cartoon.episodes.map((ep) => ({
      uuid: ep.uuid,
      number: ep.epNo,
      title: ep.epName || `ตอนที่ ${ep.epNo}`,
      price: ep.epPrice,
      isOwned: ownedEpisodeIds.has(ep.epId),
      lockAfterDatetime: episodeLockAfterMap.get(ep.epId) || null,
    })),
    genres,
    complete_status: cartoon.completionStatus === 1 ? "completed" : "ongoing",
    ageRate: cartoon.ageRate && cartoon.ageRate !== "all" ? cartoon.ageRate : undefined,
  };
}

