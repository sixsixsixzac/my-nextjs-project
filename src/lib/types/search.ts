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

