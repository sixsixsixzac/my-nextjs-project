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
    
    if (isNaN(userId)) {
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }
    
    // Fetch all settings for the user
    let settings;
    try {
      settings = await prisma.userSettings.findMany({
        where: { userId },
        select: {
          settingKey: true,
          settingValue: true,
        },
      });
    } catch (dbError) {
      console.error("Database error in userSettings.findMany:", dbError);
      throw dbError;
    }

    // Convert array to object for easier access
    const settingsMap: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsMap[setting.settingKey] = setting.settingValue;
    });

    return NextResponse.json({
      settings: settingsMap,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
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
    const body = await request.json();
    const { settingKey, settingValue } = body;

    if (!settingKey) {
      return NextResponse.json(
        { error: "settingKey is required" },
        { status: 400 }
      );
    }

    // Find existing setting
    const existingSetting = await prisma.userSettings.findFirst({
      where: {
        userId,
        settingKey,
      },
    });

    if (existingSetting) {
      // Update existing setting
      await prisma.userSettings.update({
        where: {
          id: existingSetting.id,
        },
        data: {
          settingValue: settingValue,
        },
      });
    } else {
      // Create new setting
      await prisma.userSettings.create({
        data: {
          userId,
          settingKey,
          settingValue: settingValue,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error saving user setting:", error);
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

