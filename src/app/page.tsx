import { generateMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { CartoonCarousel } from "@/components/common/CartoonCarousel";

export const metadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "ยินดีต้อนรับสู่ Pekotoon - แพลตฟอร์มที่คุณไว้วางใจ",
  keywords: ["Pekotoon", "หน้าหลัก", "home", "มังงะ", "การ์ตูน", "นิยาย"],
});

const sampleCartoons = [
  {
    uuid: "sample-1",
    title: "การผจญภัยในโลกแฟนตาซี",
    coverImage: "/images/post_img/68bec86e6f1d1.jpg",
    author: {
      name: "Peko Studio",
      avatar: "/logo/logo.png",
      verified: true,
    },
    genres: ["แฟนตาซี", "ผจญภัย"],
    views: 12800,
    chapters: 24,
    likes: 5400,
    isNew: true,
    type: "manga" as const,
    complete_status: "ongoing" as const,
  },
  {
    uuid: "sample-2",
    title: "โรงเรียนเวทมนตร์ประหลาด",
    coverImage: "/images/post_img/68bec8e78d957.jpg",
    author: {
      name: "Neko Writer",
      avatar: "/logo/logo.png",
      verified: false,
    },
    genres: ["คอมเมดี้", "แฟนตาซี"],
    views: 9600,
    chapters: 18,
    likes: 3200,
    type: "manga" as const,
    complete_status: "ongoing" as const,
  },
  {
    uuid: "sample-3",
    title: "ย้อนเวลาเป็นจอมมาร",
    coverImage: "/images/post_img/68befcb824214.jpg",
    author: {
      name: "Time Rewind",
      avatar: "/logo/logo.png",
      verified: true,
    },
    genres: ["ดราม่า", "แฟนตาซี"],
    views: 22100,
    chapters: 31,
    likes: 8800,
    type: "novel" as const,
    complete_status: "ongoing" as const,
  },
  {
    uuid: "sample-4",
    title: "ฮีโร่ตกกระป๋อง",
    coverImage: "/images/post_img/68c0fdf91832b.jpg",
    author: {
      name: "Side Hero",
      avatar: "/logo/logo.png",
      verified: false,
    },
    genres: ["แอคชั่น", "คอมเมดี้"],
    views: 7500,
    chapters: 20,
    likes: 4100,
    type: "manga" as const,
    complete_status: "ongoing" as const,
  },
  {
    uuid: "sample-5",
    title: "รักวุ่น ๆ ออนไลน์",
    coverImage: "/images/post_img/68c2225942c55.jpg",
    author: {
      name: "Heart Online",
      avatar: "/logo/logo.png",
      verified: true,
    },
    genres: ["โรแมนติก", "ดราม่า"],
    views: 18900,
    chapters: 27,
    likes: 9900,
    type: "novel" as const,
    complete_status: "ongoing" as const,
  },
  {
    uuid: "sample-6",
    title: "สงครามจักรวาลไร้สิ้นสุด",
    coverImage: "/images/post_img/68c2741256ae5.jpg",
    author: {
      name: "Galaxy Pen",
      avatar: "/logo/logo.png",
      verified: false,
    },
    genres: ["ไซไฟ", "แอคชั่น"],
    views: 30500,
    chapters: 40,
    likes: 15200,
    type: "manga" as const,
    complete_status: "completed" as const,
  },
  {
    uuid: "sample-7",
    title: "ตำนานเทพโบราณ",
    coverImage: "/images/post_img/67f8d19861a41.jpg",
    author: {
      name: "Myth Studio",
      avatar: "/logo/logo.png",
      verified: true,
    },
    genres: ["แฟนตาซี", "ดราม่า"],
    views: 27400,
    chapters: 35,
    likes: 13400,
    type: "manga" as const,
    complete_status: "completed" as const,
  },
  {
    uuid: "sample-8",
    title: "เชฟต่างโลกสายฮา",
    coverImage: "/images/post_img/68c0fdf91832b.jpg",
    author: {
      name: "Kitchen Isekai",
      avatar: "/logo/logo.png",
      verified: false,
    },
    genres: ["คอมเมดี้", "ทำอาหาร"],
    views: 9200,
    chapters: 16,
    likes: 4300,
    type: "manga" as const,
    complete_status: "ongoing" as const,
  },
] as const;

export default async function RootPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:py-10 lg:py-12">
        <section className="flex flex-col gap-4 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            ยินดีต้อนรับสู่ Pekotoon
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            แพลตฟอร์มอ่านมังงะและนิยายที่คุณไว้วางใจ รวบรวมผลงานคุณภาพจากนักเขียนไทยและต่างประเทศ
          </p>
        </section>

        <CartoonCarousel
          title="การ์ตูนแนะนำสำหรับคุณ"
          items={sampleCartoons.map((item) => ({
            uuid: item.uuid,
            title: item.title,
            coverImage: item.coverImage,
            author: {
              name: item.author.name,
              avatar: item.author.avatar,
              verified: item.author.verified,
            },
            genres: item.genres,
            views: item.views,
            chapters: item.chapters,
            likes: item.likes,
            isNew: item.isNew,
            type: item.type,
            complete_status: item.complete_status,
          }))}
        />
      </main>
    </div>
  );
}


