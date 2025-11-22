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
 * Get cartoon type from URL path
 */
export async function getCartoonTypeFromUrl(pathname: string): Promise<"manga" | "novel" | null> {
  if (pathname.startsWith("/manga/")) {
    return "manga";
  }
  if (pathname.startsWith("/novel/")) {
    return "novel";
  }
  return null;
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
        let isTemporarilyOwned = false;
        if (purchase.lockAfterDatetime === null) {
          isTemporarilyOwned = true; // Permanent ownership
        } else {
          // Ensure lockAfterDatetime is a Date object and compare
          const lockDate = purchase.lockAfterDatetime instanceof Date 
            ? purchase.lockAfterDatetime 
            : new Date(purchase.lockAfterDatetime);
          isTemporarilyOwned = lockDate > now;
        }
        
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

/**
 * Get manga episode info (pId, epNo) from UUID and episode number
 */
export async function getMangaEpisodeInfo(
  cartoonUuid: string,
  episodeNumber: string
): Promise<{ pId: number; epNo: number; epName: string; epPrice: number; epId: number; totalImage: number } | null> {
  const episodeNo = parseInt(episodeNumber);
  if (isNaN(episodeNo)) {
    return null;
  }

  const episode = await prisma.mangaEp.findFirst({
    where: {
      cartoon: {
        uuid: cartoonUuid,
        type: "manga",
        status: "active",
      },
      epNo: episodeNo,
      status: "active",
    },
    select: {
      epId: true,
      pId: true,
      epNo: true,
      epName: true,
      epPrice: true,
      totalImage: true,
    },
  });

  return episode;
}

/**
 * Check if user owns a manga episode
 */
export async function checkMangaEpisodeOwnership(
  epId: number,
  epPrice: number,
  userId?: number
): Promise<boolean> {
  // Free episodes are always accessible
  if (epPrice === 0) {
    return true;
  }

  // If no user, can't own paid episode
  if (!userId) {
    return false;
  }

  // Check ownership in SQL:
  // Episode is owned if purchase exists AND:
  // 1. lockAfterDatetime is null (permanent ownership), OR
  // 2. lockAfterDatetime > NOW() (temporary ownership still valid)
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM ep_shop
    WHERE user_id = ${userId}
      AND ep_id = ${epId}
      AND (lock_after_datetime IS NULL OR lock_after_datetime > NOW())
  `;

  const count = result[0]?.count ?? BigInt(0);
  return Number(count) > 0;
}

/**
 * Get manga episode images with pagination
 */
export async function getMangaEpisodeImages(
  pId: number,
  epNo: number,
  page: number = 1,
  limit: number = 10
): Promise<{ images: string[]; hasMore: boolean; total: number }> {
  const skip = (page - 1) * limit;

  const images = await prisma.mangaEpImage.findMany({
    where: {
      pId,
      epNo,
    },
    select: {
      epiImageName: true,
    },
    orderBy: {
      epiId: "asc",
    },
    skip,
    take: limit + 1, // Fetch one extra to check if there's more
  });

  const hasMore = images.length > limit;
  const imageList = hasMore ? images.slice(0, limit) : images;

  // Construct image URLs
  // Based on the folder structure: /images/manga_episode_images/{pId}/{epNo}/{imageName}
  const imageUrls = imageList.map((img) => 
    `/images/manga_episode_images/${pId}/${epNo}/${img.epiImageName}`
  );

  // Get total count
  const total = await prisma.mangaEpImage.count({
    where: {
      pId,
      epNo,
    },
  });

  return {
    images: imageUrls,
    hasMore,
    total,
  };
}

/**
 * Get previous and next episode numbers for navigation
 */
export async function getMangaEpisodeNavigation(
  cartoonUuid: string,
  currentEpNo: number
): Promise<{ prevEpNo: number | null; nextEpNo: number | null }> {
  // Get the cartoon's pId first
  const cartoon = await prisma.cartoon.findFirst({
    where: {
      uuid: cartoonUuid,
      type: "manga",
      status: "active",
    },
    select: {
      pId: true,
    },
  });

  if (!cartoon) {
    return { prevEpNo: null, nextEpNo: null };
  }

  // Get all episode numbers for this cartoon, ordered by epNo
  const episodes = await prisma.mangaEp.findMany({
    where: {
      pId: cartoon.pId,
      status: "active",
    },
    select: {
      epNo: true,
    },
    orderBy: {
      epNo: "asc",
    },
  });

  const episodeNumbers = episodes.map((ep) => ep.epNo);
  const currentIndex = episodeNumbers.indexOf(currentEpNo);

  const prevEpNo = currentIndex > 0 ? episodeNumbers[currentIndex - 1] : null;
  const nextEpNo = currentIndex < episodeNumbers.length - 1 ? episodeNumbers[currentIndex + 1] : null;

  return { prevEpNo, nextEpNo };
}

/**
 * Purchase a manga episode
 */
export async function purchaseMangaEpisode(
  userId: number,
  episodeInfo: { epId: number; pId: number; epNo: number; epPrice: number },
  userPoints: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Check if episode is free
    if (episodeInfo.epPrice === 0) {
      return { success: false, error: "This episode is free" };
    }

    // Check if user has enough points
    if (userPoints < episodeInfo.epPrice) {
      return { success: false, error: "Insufficient points" };
    }

    // Get episode lockDurationDays if it exists
    const fullEpisode = await prisma.mangaEp.findUnique({
      where: { epId: episodeInfo.epId },
      select: { lockDurationDays: true },
    });

    // Start transaction to purchase episode
    await prisma.$transaction(async (tx) => {
      // Deduct points from user
      await tx.userProfile.update({
        where: { id: userId },
        data: {
          point: {
            decrement: episodeInfo.epPrice,
          },
        },
      });

      // Create purchase record with SQL-calculated lockAfterDatetime
      if (fullEpisode?.lockDurationDays) {
        // Use SQL to calculate lockAfterDatetime: DATE_ADD(NOW(), INTERVAL lockDurationDays DAY)
        await tx.$executeRaw`
          INSERT INTO ep_shop (
            user_id, p_id, ep_id, ep_no, point, remain_point, lock_after_datetime
          ) VALUES (
            ${userId}, ${episodeInfo.pId}, ${episodeInfo.epId}, ${episodeInfo.epNo}, 
            ${episodeInfo.epPrice}, ${userPoints - episodeInfo.epPrice}, 
            DATE_ADD(NOW(), INTERVAL ${fullEpisode.lockDurationDays} DAY)
          )
        `;
      } else {
        // Create purchase record without lockAfterDatetime
        await tx.epShop.create({
          data: {
            userId: userId,
            pId: episodeInfo.pId,
            epId: episodeInfo.epId,
            epNo: episodeInfo.epNo,
            point: episodeInfo.epPrice,
            remainPoint: userPoints - episodeInfo.epPrice,
            lockAfterDatetime: null,
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error purchasing episode:", error);
    return { success: false, error: "Internal server error" };
  }
}


