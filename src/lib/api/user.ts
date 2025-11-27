"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export interface UserData {
  userId: number | undefined;
  buyImmediately: boolean;
  loadFullImages: boolean;
  userPoints: number | null;
}

/**
 * Get user data including settings and points
 * Optimized to fetch both in parallel when possible
 */
export async function getUserData(): Promise<UserData> {
  const user = await getCurrentUser();
  const userId = user?.id ? parseInt(user.id) : undefined;

  if (!userId) {
    return {
      userId: undefined,
      buyImmediately: false,
      loadFullImages: false,
      userPoints: null,
    };
  }

  // Fetch settings and points in parallel for better performance
  // Handle case where user_settings table might not exist
  let settings: Array<{ settingKey: string; settingValue: any }> = [];
  try {
    settings = await prisma.userSettings.findMany({
      where: {
        userId,
        settingKey: {
          in: ["buyImmediately", "loadFullImages"],
        },
      },
      select: {
        settingKey: true,
        settingValue: true,
      },
    });
  } catch (error) {
    // If user_settings table doesn't exist, use empty array (default values)
    // Only log the error message to avoid source map issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("does not exist") || errorMessage.includes("Table") || errorMessage.includes("table")) {
      // Silently handle missing table - this is expected if migrations haven't run
    } else {
      // Log other unexpected errors
      console.warn("Error fetching user settings, using default values:", errorMessage);
    }
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { point: true },
  });

  // Map settings to object for easier access
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.settingKey] = setting.settingValue;
    return acc;
  }, {} as Record<string, any>);

  const buyImmediately = settingsMap.buyImmediately === true;
  const loadFullImages = settingsMap.loadFullImages === true;
  const userPoints = userProfile?.point ?? null;

  return {
    userId,
    buyImmediately,
    loadFullImages,
    userPoints,
  };
}

