import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { validateDisplayName } from "@/lib/utils/text-validation";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json(
        { error: "displayName is required" },
        { status: 400 }
      );
    }

    // Validate display name
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid display name" },
        { status: 400 }
      );
    }

    const trimmedDisplayName = displayName.trim();

    // Update user profile
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        displayName: trimmedDisplayName,
      },
    });

    return NextResponse.json({
      success: true,
      displayName: trimmedDisplayName,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    // In development, include more error details
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          message: errorMessage,
          stack: errorStack,
        })
      },
      { status: 500 }
    );
  }
}

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
    
    if (isNaN(userId)) {
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Fetch user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      displayName: userProfile.displayName,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    // In development, include more error details
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          message: errorMessage,
          stack: errorStack,
        })
      },
      { status: 500 }
    );
  }
}

