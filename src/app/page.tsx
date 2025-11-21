import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { CartoonSectionServer } from "@/components/CartoonSectionServer";
import { getCartoonsByType } from "@/lib/api/mockSearchApi";
import dynamic from "next/dynamic";

// Lazy load the second section (below the fold) to reduce initial JavaScript bundle
const CartoonSectionWrapper = dynamic(
  () => import("@/components/CartoonSectionWrapper").then((mod) => ({ default: mod.CartoonSectionWrapper })),
  { ssr: true }
);

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

export default async function Home() {
  // Fetch data for the first section on the server to improve LCP
  // Only fetch enough items for the initial view (desktop: 5, so fetch 6-7 for buffer)
  const mangaData = await getCartoonsByType("manga", "popular", 7);
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Manga Section - Server-side rendered with pre-fetched data for better LCP */}
        <CartoonSectionServer
          title="มังงะยอดนิยม"
          description="มังงะที่ได้รับความนิยมมากที่สุด"
          cartoonType="manga"
          type="popular"
          itemsPerView={{
            mobile: 2,
            tablet: 3,
            desktop: 5,
          }}
          className="mb-12"
          initialData={mangaData}
        />

        {/* Novel Section - Client-side rendered (below the fold) */}
        <CartoonSectionWrapper
          title="นิยายยอดนิยม"
          description="นิยายที่ได้รับความนิยมมากที่สุด"
          cartoonType="novel"
          type="popular"
          itemsPerView={{
            mobile: 2,
            tablet: 3,
            desktop: 5,
          }}
        />
      </div>
    </div>
  );
}
