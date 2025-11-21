import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import LandingPage from "@/app/(frontend)/landing/page";

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

export default async function RootPage() {
  return <LandingPage />;
}

