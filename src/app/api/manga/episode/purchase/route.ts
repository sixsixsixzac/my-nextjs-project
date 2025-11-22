import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getMangaEpisodeInfo, checkMangaEpisodeOwnership, purchaseMangaEpisode } from "@/lib/api/cartoon";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(user.id);
    const body = await request.json();
    const { cartoonUuid, episode, epId } = body;

    if (!cartoonUuid || !episode || !epId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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

    // Check if already owned
    const isOwned = await checkMangaEpisodeOwnership(
      episodeInfo.epId,
      episodeInfo.epPrice,
      userId
    );

    if (isOwned) {
      return NextResponse.json(
        { error: "You already own this episode" },
        { status: 400 }
      );
    }

    // Get user points
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { point: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Use the shared purchase function
    const result = await purchaseMangaEpisode(
      userId,
      {
        epId: episodeInfo.epId,
        pId: episodeInfo.pId,
        epNo: episodeInfo.epNo,
        epPrice: episodeInfo.epPrice,
      },
      userProfile.point
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Episode purchased successfully",
    });
  } catch (error) {
    console.error("Error purchasing episode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

