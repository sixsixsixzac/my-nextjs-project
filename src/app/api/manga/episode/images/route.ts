import { NextRequest, NextResponse } from "next/server";
import { getMangaEpisodeImages, getMangaEpisodeInfo, getMangaEpisodeNavigation, checkMangaEpisodeOwnership } from "@/lib/api/cartoon";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cartoonUuid = searchParams.get("cartoonUuid");
    const episode = searchParams.get("episode");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1");

    if (!cartoonUuid || !episode) {
      return NextResponse.json(
        { error: "Missing cartoonUuid or episode parameter" },
        { status: 400 }
      );
    }

    // Get episode info
    const episodeInfo = await getMangaEpisodeInfo(cartoonUuid, episode);
    if (!episodeInfo) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const user = await getCurrentUser();
    const userId = user?.id ? parseInt(user.id) : undefined;
    const isOwned = await checkMangaEpisodeOwnership(
      episodeInfo.epId,
      episodeInfo.epPrice,
      userId
    );

    if (!isOwned) {
      // Get navigation info for unlock component
      const navigation = await getMangaEpisodeNavigation(cartoonUuid, episodeInfo.epNo);
      
      return NextResponse.json(
        {
          error: "You don't own this episode",
          isOwned: false,
          episodeInfo: {
            epId: episodeInfo.epId,
            epNo: episodeInfo.epNo,
            epName: episodeInfo.epName,
            epPrice: episodeInfo.epPrice,
          },
          navigation,
        },
        { status: 403 }
      );
    }

    // Get images
    const result = await getMangaEpisodeImages(
      episodeInfo.pId,
      episodeInfo.epNo,
      page,
      limit
    );

    // Get navigation info (only on first page load)
    let navigation = null;
    if (page === 1) {
      navigation = await getMangaEpisodeNavigation(cartoonUuid, episodeInfo.epNo);
    }

    return NextResponse.json({
      ...result,
      episodeInfo: {
        epName: episodeInfo.epName,
        epNo: episodeInfo.epNo,
      },
      navigation,
    });
  } catch (error) {
    console.error("Error fetching manga episode images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

