import { getMangaEpisodeInfo, checkMangaEpisodeOwnership, getMangaEpisodeNavigation, purchaseMangaEpisode } from "@/lib/api/cartoon";
import { getUserData } from "@/lib/api/user";
import { MangaRead } from "@/app/(frontend)/(cartoon)/components/MangaRead";
import { EpisodeUnlock } from "@/app/(frontend)/(cartoon)/components/EpisodeUnlock";
import { notFound, redirect } from "next/navigation";

export default async function MangaReadingPage({
  params,
}: {
  params: Promise<{ uuid: string; episode: string }>;
}) {
  const { uuid, episode } = await params;

  // Check episode ownership server-side
  const episodeInfo = await getMangaEpisodeInfo(uuid, episode);

  if (!episodeInfo) {
    notFound();
  }

  // Fetch user data and navigation in parallel for better performance
  const [userData, navigation] = await Promise.all([
    getUserData(),
    getMangaEpisodeNavigation(uuid, episodeInfo.epNo),
  ]);

    const { userId, buyImmediately, loadFullImages, userPoints } = userData;

  // Check ownership after getting user data
  const isOwned = await checkMangaEpisodeOwnership(
    episodeInfo.epId,
    episodeInfo.epPrice,
    userId
  );

  if (!isOwned) {
    // Auto-purchase if buyImmediately is enabled and user has enough points
    if (buyImmediately && userId && userPoints !== null && userPoints >= episodeInfo.epPrice && episodeInfo.epPrice > 0) {
      const result = await purchaseMangaEpisode(
        userId,
        {
          epId: episodeInfo.epId,
          pId: episodeInfo.pId,
          epNo: episodeInfo.epNo,
          epPrice: episodeInfo.epPrice,
        },
        userPoints
      );
      if (result.success) {
        // Redirect to refresh the page and show the purchased episode with auto-purchase notification
        redirect(`/manga/${uuid}/${episode}?autoPurchased=true&epPrice=${episodeInfo.epPrice}&epNo=${episodeInfo.epNo}`);
      } else {
        // If auto-purchase fails, redirect with error notification
        redirect(`/manga/${uuid}/${episode}?autoPurchaseFailed=true&error=${encodeURIComponent(result.error || "ไม่สามารถซื้อตอนได้")}`);
      }
    }

    // Show unlock component if user doesn't own the episode
    return (
      <div className="max-w-6xl mx-auto">
        <EpisodeUnlock
          cartoonUuid={uuid}
          episode={episode}
          episodeInfo={{
            epId: episodeInfo.epId,
            epNo: episodeInfo.epNo,
            epName: episodeInfo.epName,
            epPrice: episodeInfo.epPrice,
          }}
          navigation={navigation}
          userPoints={userPoints}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <MangaRead
        cartoonUuid={uuid}
        episode={episode}
        buyImmediately={buyImmediately}
        loadFullImages={loadFullImages}
        userPoints={userPoints}
      />
    </div>
  );
}

