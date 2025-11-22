import { NextRequest, NextResponse } from "next/server";
import { getNovelEpisodeContent, getEpisodeInfo, getEpisodeNavigation, checkEpisodeOwnership } from "@/lib/api/cartoon";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cartoonUuid = searchParams.get("cartoonUuid");
    const episode = searchParams.get("episode");

    if (!cartoonUuid || !episode) {
      return NextResponse.json(
        { error: "Missing cartoonUuid or episode parameter" },
        { status: 400 }
      );
    }

    // Get episode info
    const episodeInfo = await getEpisodeInfo("novel", cartoonUuid, episode);
    if (!episodeInfo) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const user = await getCurrentUser();
    const userId = user?.id ? parseInt(user.id) : undefined;
    const isOwned = await checkEpisodeOwnership(
      episodeInfo.epId,
      episodeInfo.epPrice,
      userId
    );

    if (!isOwned) {
      // Get navigation info for unlock component
      const navigation = await getEpisodeNavigation("novel", cartoonUuid, episodeInfo.epNo);
      
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

    // Get content
    const result = await getNovelEpisodeContent(
      episodeInfo.pId,
      episodeInfo.epNo
    );

    // Get navigation info
    const navigation = await getEpisodeNavigation("novel", cartoonUuid, episodeInfo.epNo);

    return NextResponse.json({
      ...result,
      episodeInfo: {
        epName: episodeInfo.epName,
        epNo: episodeInfo.epNo,
      },
      navigation,
    });
  } catch (error) {
    console.error("Error fetching novel episode content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

