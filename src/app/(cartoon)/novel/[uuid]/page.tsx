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
    title: "นิยาย",
    description: "รายละเอียดนิยาย",
    keywords: ["นิยาย", "novel"],
  });
}

export default async function NovelPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  
  // TODO: Fetch actual data from API/database based on uuid
  // For now, return 404 if no data found
  notFound();
}

