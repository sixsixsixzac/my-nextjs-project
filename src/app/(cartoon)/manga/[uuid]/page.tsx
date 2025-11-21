import { CartoonDetailPage } from "@/components/CartoonDetailPage";
import { generateMetadata as genMeta } from "@/lib/utils/metadata";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  // TODO: Fetch actual data from API/database based on uuid
  return genMeta({
    title: "มังงะ",
    description: "รายละเอียดมังงะ",
    keywords: ["มังงะ", "manga"],
  });
}

export default async function MangaPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  
  // TODO: Fetch actual data from API/database based on uuid
  // For now, return 404 if no data found
  notFound();
}

