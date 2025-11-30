import { prisma } from "@/lib/prisma"
import { WebSettingProvider } from "./WebSettingProvider"
import type { ReactNode } from "react"
import type { WebSettingBase } from "@/types/models"

interface WebSettingProviderWrapperProps {
  children: ReactNode
}

export async function WebSettingProviderWrapper({
  children,
}: WebSettingProviderWrapperProps) {
  // Fetch all web settings from database
  // During build time, database might not be available, so we handle errors gracefully
  let settings: WebSettingBase[] = []
  try {
    settings = await prisma.webSetting.findMany({
      orderBy: {
        key: "asc",
      },
    })
  } catch (error) {
    // During build time or if database is unavailable, use empty settings
    // At runtime, the settings will be fetched properly
    console.warn("Failed to fetch web settings, using empty settings:", error)
    settings = []
  }

  return <WebSettingProvider settings={settings}>{children}</WebSettingProvider>
}

