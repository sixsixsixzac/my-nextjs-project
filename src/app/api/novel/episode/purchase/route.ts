import { NextRequest, NextResponse } from "next/server";
import { purchaseEpisode } from "@/lib/api/cartoon";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { episodeUuids, cartoonUuid, episode } = body;

    let episodeUuidsArray: string[];

    // Support both new format (episodeUuids array) and old format (cartoonUuid + episode)
    if (episodeUuids && Array.isArray(episodeUuids)) {
      episodeUuidsArray = episodeUuids;
    } else if (cartoonUuid && episode) {
      // Old format: fetch episode UUID from cartoonUuid and episode number
      const episodeRecord = await prisma.mangaEp.findFirst({
        where: {
          cartoon: {
            uuid: cartoonUuid,
            type: "novel",
            status: "active",
          },
          epNo: typeof episode === "string" ? parseInt(episode) : episode,
          status: "active",
        },
        select: {
          uuid: true,
        },
      });

      if (!episodeRecord) {
        return NextResponse.json(
          { error: "Episode not found" },
          { status: 404 }
        );
      }

      episodeUuidsArray = [episodeRecord.uuid];
    } else {
      return NextResponse.json(
        { error: "Missing required parameters: episodeUuids array or (cartoonUuid and episode)" },
        { status: 400 }
      );
    }

    // Use the shared purchase function (now handles session and user points internally)
    const result = await purchaseEpisode(episodeUuidsArray);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Episode(s) purchased successfully",
    });
  } catch (error) {
    console.error("Error purchasing episode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

