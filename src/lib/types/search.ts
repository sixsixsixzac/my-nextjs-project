import { CartoonCardProps } from "@/components/common/CartoonCard";

export interface SearchFilters {
  name?: string;
  complete_status?: "all" | "completed" | "ongoing";
  cartoonType?: "all" | "manga" | "novel";
  orderBy?: "relevance" | "views" | "likes" | "latest" | "chapters" | "latest_update";
  mainCategory?: "all" | string | string[];
  subCategory?: "all" | string | string[];
  age?: "all" | "all_ages" | "teen" | "mature";
  original?: "all" | "1" | "2" | "3" | "4"; // 1=Thai, 2=Japanese, 3=Korean, 4=Chinese
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

