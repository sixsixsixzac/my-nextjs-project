import { CartoonDetailPage } from "@/app/(auth)/(cartoon)/components/CartoonDetailPage";
import { CartoonEpisodeList } from "@/app/(auth)/(cartoon)/components/CartoonEpisodeList";
import { FollowUserButtonClient } from "@/components/common/FollowUserButtonClient";
import { generateMetadata as genMeta } from "@/lib/utils/metadata";
import { getCartoonByUuid } from "@/lib/api/frontend.cartoon";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  try {
    const cartoon = await getCartoonByUuid(uuid, "manga");
    return genMeta({
      title: cartoon.title,
      description: cartoon.description,
      keywords: ["มังงะ", "manga", cartoon.title, ...cartoon.genres],
    });
  } catch {
    return genMeta({
      title: "มังงะ",
      description: "รายละเอียดมังงะ",
      keywords: ["มังงะ", "manga"],
    });
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const cartoon = await getCartoonByUuid(uuid, "manga");
  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser?.id;

  return (
    <>
      <CartoonDetailPage
        type="manga"
        title={cartoon.title}
        coverImage={cartoon.coverImage}
        author={cartoon.author}
        stats={cartoon.stats}
        description={cartoon.description}
        uuid={cartoon.uuid}
        followButton={
          isLoggedIn ? (
            <FollowUserButtonClient
              targetUserUuid={cartoon.author.uuid}
              initialIsFollowing={cartoon.isFollowingAuthor || false}
              className="shrink-0"
            />
          ) : undefined
        }
      />

      <CartoonEpisodeList 
        episodes={cartoon.episodes} 
        type="manga" 
        uuid={cartoon.uuid}
        totalEpisodes={cartoon.stats.episodes}
      />
    </>
  );
}
