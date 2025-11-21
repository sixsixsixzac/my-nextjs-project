import { CartoonCardProps } from "@/components/CartoonCard";

export interface SearchFilters {
  name?: string;
  complete_status?: "all" | "completed" | "ongoing";
  cartoonType?: "all" | "manga" | "novel";
  orderBy?: "relevance" | "views" | "likes" | "latest" | "chapters" | "latest_update";
  mainCategory?: "all" | string;
  subCategory?: "all" | string;
  age?: "all" | "all_ages" | "teen" | "mature";
  original?: "all" | "original" | "adaptation";
}

export interface SearchParams extends SearchFilters {
  page: number;
  limit: number;
}

export interface SearchResponse {
  data: CartoonCardProps[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// JSONPlaceholder API types
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

// Genre pool for mapping
const genres = [
  "แอคชั่น",
  "ผจญภัย",
  "แฟนตาซี",
  "โรแมนติก",
  "ชีวิตประจำวัน",
  "สยองขวัญ",
  "ลึกลับ",
  "ระทึกขวัญ",
  "ประวัติศาสตร์",
  "ไซไฟ",
];

// Fetch and transform JSONPlaceholder data
async function fetchCartoonsData(): Promise<CartoonCardProps[]> {
  try {
    // Fetch posts and users in parallel
    const [postsResponse, usersResponse] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/posts"),
      fetch("https://jsonplaceholder.typicode.com/users"),
    ]);

    const posts: Post[] = await postsResponse.json();
    const users: User[] = await usersResponse.json();

    // Create a user map for quick lookup
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Transform posts to CartoonCardProps
    return posts.map((post, index) => {
      const user = userMap.get(post.userId) || users[0];
      const isNovel = index % 2 === 0;
      const id = isNovel ? `n${post.id}` : String(post.id);

      // Generate genres deterministically based on post ID (2-3 genres per item)
      const numGenres = 2 + (post.id % 2);
      // Use post ID as seed for consistent genre selection
      const seed = post.id;
      const selectedGenres = genres
        .map((genre, idx) => ({ genre, sort: (seed + idx) % 1000 }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, numGenres)
        .map((item) => item.genre);

      // Generate stats based on post ID for consistency
      const views = (post.id * 100) + Math.floor(Math.random() * 500);
      const chapters = 50 + (post.id % 200);
      const likes = Math.floor(views * 0.3) + Math.floor(Math.random() * 200);

      // Generate a short deterministic UUID based on post and user IDs
      // Format: 12-character hexadecimal string (e.g., "7c32c95a55a4")
      const generateUUID = (seed1: number, seed2: number): string => {
        // Combine seeds and create a deterministic hash
        const combined = (seed1 * 2654435761) ^ (seed2 * 2246822507);
        const hash = ((combined % 2**48) + (seed1 * seed2) % 2**48).toString(16).padStart(12, '0');
        return hash;
      };
      
      const uuid = generateUUID(post.id, post.userId);

      return {
        id,
        uuid,
        title: post.title,
        coverImage: `https://api.dicebear.com/7.x/adventurer/png?seed=${post.id}&size=400&backgroundColor=${index % 2 === 0 ? 'b6e3f4' : 'ffd5dc'}`,
        author: {
          name: user.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${user.username}&size=100`,
          verified: post.userId % 3 === 0,
        },
        genres: selectedGenres,
        views,
        chapters,
        likes,
        isNew: post.id <= 10,
        href: isNovel ? `/novel/${uuid}` : `/manga/${uuid}`,
        type: isNovel ? "novel" : "manga",
        complete_status: post.id % 3 === 0 ? "completed" : "ongoing",
      };
    });
  } catch (error) {
    console.error("Error fetching cartoons data:", error);
    return [];
  }
}

// Cache the fetched data
let cachedCartoons: CartoonCardProps[] | null = null;
let fetchPromise: Promise<CartoonCardProps[]> | null = null;

export async function getAllCartoons(): Promise<CartoonCardProps[]> {
  if (cachedCartoons) {
    return cachedCartoons;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetchCartoonsData();
  cachedCartoons = await fetchPromise;
  fetchPromise = null;

  return cachedCartoons;
}

// Server-side function to get cartoons by type and sort order
export async function getCartoonsByType(
  cartoonType: "manga" | "novel",
  type: "popular" | "latest" | "trending" = "popular",
  limit?: number
): Promise<CartoonCardProps[]> {
  const allCartoons = await getAllCartoons();
  
  // Filter by cartoonType
  const filteredData = allCartoons.filter((item) => {
    if (cartoonType === "manga") {
      return item.type === "manga" || !item.id.startsWith("n");
    } else {
      return item.type === "novel" || item.id.startsWith("n");
    }
  });
  
  // Sort based on type
  let sortedData = [...filteredData];
  switch (type) {
    case "popular":
      sortedData.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case "latest":
      sortedData.sort((a, b) => {
        const aId = parseInt(a.id.replace("n", ""));
        const bId = parseInt(b.id.replace("n", ""));
        return bId - aId;
      });
      break;
    case "trending":
      sortedData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    default:
      sortedData.sort((a, b) => (b.views || 0) - (a.views || 0));
  }
  
  // Limit results if specified
  if (limit) {
    return sortedData.slice(0, limit);
  }
  
  return sortedData;
}

// Search API function using JSONPlaceholder
export async function searchCartoons(
  params: SearchParams
): Promise<SearchResponse> {
  // Fetch all cartoons from JSONPlaceholder
  const allCartoons = await getAllCartoons();

  let filtered = [...allCartoons];

  // Filter by name (case-insensitive search in title)
  if (params.name && params.name.trim()) {
    const searchTerm = params.name.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by cartoonType
  if (params.cartoonType && params.cartoonType !== "all") {
    filtered = filtered.filter((item) => {
      const isManga = !item.id.startsWith("n");
      return params.cartoonType === "manga" ? isManga : !isManga;
    });
  }

  // Filter by complete_status
  if (params.complete_status && params.complete_status !== "all") {
    filtered = filtered.filter(
      (item) => (item.complete_status || "ongoing") === params.complete_status
    );
  }

  // Filter by mainCategory (using genres)
  if (params.mainCategory && params.mainCategory !== "all") {
    filtered = filtered.filter((item) =>
      item.genres.some((genre) =>
        genre.toLowerCase().includes(params.mainCategory!.toLowerCase())
      )
    );
  }

  // Filter by subCategory (simplified - using genres)
  if (params.subCategory && params.subCategory !== "all") {
    // This is a simplified implementation
    // In a real app, you'd have a separate subCategory field
  }

  // Filter by age (simplified - all items pass for now)
  // In a real app, you'd have an age rating field

  // Filter by original (simplified - all items pass for now)
  // In a real app, you'd have an original field

  // Sort by orderBy
  switch (params.orderBy) {
    case "views":
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case "likes":
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    case "latest":
    case "latest_update":
      filtered.sort((a, b) => parseInt(b.id.replace("n", "")) - parseInt(a.id.replace("n", "")));
      break;
    case "chapters":
      filtered.sort((a, b) => (b.chapters || 0) - (a.chapters || 0));
      break;
    case "relevance":
    default:
      // For relevance, prioritize items matching search term
      if (params.name && params.name.trim()) {
        const searchTerm = params.name.toLowerCase().trim();
        filtered.sort((a, b) => {
          const aStarts = a.title.toLowerCase().startsWith(searchTerm);
          const bStarts = b.title.toLowerCase().startsWith(searchTerm);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return (b.views || 0) - (a.views || 0);
        });
      } else {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      }
      break;
  }

  // Pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    data: paginated,
    total: filtered.length,
    page: params.page,
    limit: params.limit,
    hasMore: endIndex < filtered.length,
  };
}

