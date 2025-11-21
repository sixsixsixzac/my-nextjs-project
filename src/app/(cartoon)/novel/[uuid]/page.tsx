import { CartoonDetailPage } from "@/components/CartoonDetailPage";
import { generateMetadata as genMeta } from "@/lib/utils/metadata";

// Mock data - In production, fetch from API/database
const novelData = {
  title: "จ้าวสงคราม",
  coverImage: "https://api.dicebear.com/7.x/shapes/svg?seed=novel-cover",
  author: {
    display_name: "Naruha",
    uuid: "0000236b4a7c",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=naruha",
    is_online: true,
  },
  stats: {
    episodes: 217,
    views: 1313,
    likes: 225,
  },
  description:
    "ดันซายูผู้เป็นทายาทของโครยอ แค้นเคืองพื้นที่ภาคกลางอย่างมากเพราะทำร้ายสหายที่มีค่าที่สุดของเขา เขาครอบครองวรยุทธที่ไม่มีใครหยุดเขาได้! พลังแม่ทัพปืนใหญ่สวรรค์ สุดยอดวรยุทธแห่งโครยอ! ตำนานของแม่ทัพปืนใหญ่สวรรค์ยังคงอยู่ ในขณะที่ประวัติศาสตร์ของจ้าวสงครามเริ่มชัดเจนขึ้น!",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  // In production, fetch actual data based on uuid
  return genMeta({
    title: novelData.title,
    description: novelData.description,
    keywords: ["นิยาย", "novel", novelData.title, novelData.author.display_name],
    image: novelData.coverImage,
  });
}

export default async function NovelPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const chapters = Array.from({ length: 50 }, (_, i) => ({
    id: i + 168,
    number: i + 168,
    title: `ตอนที่ ${i + 168}`,
  }));

  return (
    <CartoonDetailPage
      type="novel"
      title={novelData.title}
      coverImage={novelData.coverImage}
      author={novelData.author}
      stats={novelData.stats}
      description={novelData.description}
      episodes={chapters}
      uuid={uuid}
    />
  );
}

