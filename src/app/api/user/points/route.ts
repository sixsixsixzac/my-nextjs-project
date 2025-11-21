import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        point: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      points: userProfile.point,
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

