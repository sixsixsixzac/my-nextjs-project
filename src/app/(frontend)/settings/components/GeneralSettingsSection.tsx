"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings as SettingsIcon } from "lucide-react"
import { toast } from "sonner"

export function GeneralSettingsSection() {
  const { data: session, status } = useSession()
  const [buyImmediately, setBuyImmediately] = useState(false)
  const [loadFullImages, setLoadFullImages] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch settings on mount (only when session is available)
  useEffect(() => {
    // Wait for session to be loaded
    if (status === "loading") {
      return
    }

    // If no session, don't try to fetch
    if (status === "unauthenticated" || !session?.user?.id) {
      setIsLoading(false)
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
          console.error("Failed to fetch settings:", errorMessage, response.status)
          throw new Error(errorMessage)
        }
        const data = await response.json()
        const settings = data.settings || {}
        
        setBuyImmediately(settings.buyImmediately === true)
        setLoadFullImages(settings.loadFullImages === true)
      } catch (error) {
        console.error("Error fetching settings:", error)
        // Only show toast for non-401 errors (unauthorized is expected if not logged in)
        if (error instanceof Error && !error.message.includes("401") && !error.message.includes("Unauthorized")) {
          toast.error("ไม่สามารถโหลดการตั้งค่าได้")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [session, status])

  // Save setting to database
  const saveSetting = async (key: string, value: boolean) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingKey: key,
          settingValue: value,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error("Failed to save setting:", errorMessage, response.status)
        throw new Error(errorMessage)
      }

      toast.success("บันทึกการตั้งค่าสำเร็จ")
    } catch (error) {
      console.error("Error saving setting:", error)
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        toast.error("กรุณาเข้าสู่ระบบเพื่อบันทึกการตั้งค่า")
      } else {
        toast.error("ไม่สามารถบันทึกการตั้งค่าได้")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleBuyImmediatelyChange = (checked: boolean) => {
    setBuyImmediately(checked)
    saveSetting("buyImmediately", checked)
  }

  const handleLoadFullImagesChange = (checked: boolean) => {
    setLoadFullImages(checked)
    saveSetting("loadFullImages", checked)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          การตั้งค่าทั่วไป
        </CardTitle>
        <CardDescription>
          จัดการการตั้งค่าการใช้งานทั่วไป
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="buy-immediately" className="text-base">
              ซื้อทันทีเมื่อเปลี่ยนตอน
            </Label>
            <p className="text-sm text-muted-foreground">
              ซื้อตอนใหม่โดยอัตโนมัติเมื่อเปลี่ยนตอน
            </p>
          </div>
          <Switch
            id="buy-immediately"
            checked={buyImmediately}
            onCheckedChange={handleBuyImmediatelyChange}
            disabled={isLoading || isSaving}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="load-full-images" className="text-base">
              โหลดภาพแบบเต็ม
            </Label>
            <p className="text-sm text-muted-foreground">
              โหลดภาพความละเอียดสูงทั้งหมดทันที
            </p>
          </div>
          <Switch
            id="load-full-images"
            checked={loadFullImages}
            onCheckedChange={handleLoadFullImagesChange}
            disabled={isLoading || isSaving}
          />
        </div>
      </CardContent>
    </Card>
  )
}

