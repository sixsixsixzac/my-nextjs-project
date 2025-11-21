import { prisma } from "@/lib/prisma";

export interface Category {
  id: string;
  name: string;
}

/**
 * Fetches all active categories from the database
 */
export async function getAllCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: {
      status: 1, // Only active categories
    },
    select: {
      id: true,
      categoryName: true,
    },
    orderBy: {
      categoryName: "asc",
    },
  });

  return categories.map((cat) => ({
    id: cat.id.toString(),
    name: cat.categoryName,
  }));
}

