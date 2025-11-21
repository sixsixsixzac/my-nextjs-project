import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { CartoonSection } from "@/components/CartoonSection";

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

export default async function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Popular Manga Section */}
        <CartoonSection
          title="มังงะยอดนิยม"
          subtitle="มังงะที่ได้รับความนิยมสูงสุดจากผู้อ่าน"
          cartoonType="manga"
          orderBy="views"
          page={1}
          limit={6}
          moreHref="/search?cartoonType=manga&orderBy=views"
        />

        {/* Latest Updated Manga Section */}
        <CartoonSection
          title="มังงะอัปเดตล่าสุด"
          subtitle="มังงะที่ได้รับการอัปเดตล่าสุด"
          cartoonType="manga"
          orderBy="latest_update"
          page={1}
          limit={6}
          moreHref="/search?cartoonType=manga&orderBy=latest_update"
        />

        {/* New Manga Section */}
        <CartoonSection
          title="มังงะใหม่"
          subtitle="มังงะที่เพิ่งเปิดตัวใหม่"
          cartoonType="manga"
          orderBy="latest"
          page={1}
          limit={6}
          moreHref="/search?cartoonType=manga&orderBy=latest"
        />

        {/* Popular Novel Section */}
        <CartoonSection
          title="นิยายยอดนิยม"
          subtitle="นิยายที่ได้รับความนิยมสูงสุดจากผู้อ่าน"
          cartoonType="novel"
          orderBy="views"
          page={1}
          limit={6}
          moreHref="/search?cartoonType=novel&orderBy=views"
        />

        {/* Latest Updated Novel Section */}
        <CartoonSection
          title="นิยายอัปเดตล่าสุด"
          subtitle="นิยายที่ได้รับการอัปเดตล่าสุด"
          cartoonType="novel"
          orderBy="latest_update"
          page={1}
          limit={6}
          moreHref="/search?cartoonType=novel&orderBy=latest_update"
        />

        {/* New Novel Section */}
        <CartoonSection
          title="นิยายใหม่"
          subtitle="นิยายที่เพิ่งเปิดตัวใหม่"
          cartoonType="novel"
          orderBy="latest"
          page={1}
          limit={6}
          moreHref="/search?cartoonType=novel&orderBy=latest"
        />
      </div>
    </div>
  );
}
