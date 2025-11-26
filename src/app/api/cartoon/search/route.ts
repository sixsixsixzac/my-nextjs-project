import { NextRequest, NextResponse } from "next/server";
import { searchCartoons } from "@/lib/api/search";
import type { SearchParams } from "@/lib/types/search";

const CARTOON_TYPES = ["all", "manga", "novel"] as const;
const COMPLETE_STATUS = ["all", "completed", "ongoing"] as const;
const ORDER_BY_VALUES = ["relevance", "views", "likes", "latest", "chapters", "latest_update"] as const;
const AGE_VALUES = ["all", "all_ages", "teen", "mature"] as const;
const ORIGINAL_VALUES = ["all", "1", "2", "3", "4"] as const;

function toPositiveInt(value: string | null, fallback: number): number {
  const num = Number(value);
  return Number.isNaN(num) || num < 1 ? fallback : num;
}

function parseEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!value) return fallback;
  return (allowed.includes(value as T) ? value : fallback) as T;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), 12);

  const name = searchParams.get("name") ?? undefined;
  const cartoonType = parseEnum(searchParams.get("cartoonType"), CARTOON_TYPES, "all");
  const complete_status = parseEnum(searchParams.get("complete_status"), COMPLETE_STATUS, "all");
  const orderBy = parseEnum(searchParams.get("orderBy"), ORDER_BY_VALUES, "latest");
  const age = parseEnum(searchParams.get("age"), AGE_VALUES, "all");
  const original = parseEnum(searchParams.get("original"), ORIGINAL_VALUES, "all");

  const mainCategoryParams = searchParams.getAll("mainCategory");
  const subCategoryParams = searchParams.getAll("subCategory");

  const mainCategory =
    mainCategoryParams.length === 0
      ? "all"
      : mainCategoryParams.length === 1
        ? mainCategoryParams[0]
        : mainCategoryParams;

  const subCategory =
    subCategoryParams.length === 0
      ? "all"
      : subCategoryParams.length === 1
        ? subCategoryParams[0]
        : subCategoryParams;

  const query: SearchParams = {
    page,
    limit,
    name,
    cartoonType,
    complete_status,
    orderBy,
    mainCategory,
    subCategory,
    age,
    original,
  };

  const result = await searchCartoons(query);

  return NextResponse.json(result);
}

