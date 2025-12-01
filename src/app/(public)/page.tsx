import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { CartoonCarouselWrapper } from "@/components/common/CartoonCarouselWrapper";
import { LazyCartoonCarousel } from "@/components/common/LazyCartoonCarousel";

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

// Force dynamic rendering to prevent static generation errors
// This page uses database queries that aren't available during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:py-10 lg:py-12">
        <CartoonCarouselWrapper
          title="มังงะยอดนิยม"
          className="mt-2"
          priorityFirst
          filters={{
            orderBy: "views",
            cartoonType: "manga",
          }}
        />
        <CartoonCarouselWrapper
          title="มังงะอัปเดตล่าสุด"
          className="mt-2"
          filters={{
            orderBy: "latest_update",
            cartoonType: "manga",
          }}
        />
        <LazyCartoonCarousel
          title="มังงะใหม่"
          className="mt-2"
          filters={{
            orderBy: "latest",
            cartoonType: "manga",
          }}
        />

        <LazyCartoonCarousel
          title="นิยายยอดนิยม"
          className="mt-8"
          filters={{
            orderBy: "views",
            cartoonType: "novel",
          }}
        />
        <LazyCartoonCarousel
          title="นิยายอัปเดตล่าสุด"
          className="mt-2"
          filters={{
            orderBy: "latest_update",
            cartoonType: "novel",
          }}
        />
        <LazyCartoonCarousel
          title="นิยายใหม่"
          className="mt-2"
          filters={{
            orderBy: "latest",
            cartoonType: "novel",
          }}
        />
      </main>
    </div>
  );
}


