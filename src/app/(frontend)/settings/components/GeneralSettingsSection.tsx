"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings as SettingsIcon } from "lucide-react"

interface GeneralSettingsSectionProps {
  buyImmediately?: boolean
  loadFullImages?: boolean
  onBuyImmediatelyChange?: (checked: boolean) => void
  onLoadFullImagesChange?: (checked: boolean) => void
}

export function GeneralSettingsSection({
  buyImmediately = false,
  loadFullImages = false,
  onBuyImmediatelyChange,
  onLoadFullImagesChange,
}: GeneralSettingsSectionProps) {
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
            onCheckedChange={onBuyImmediatelyChange}
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
            onCheckedChange={onLoadFullImagesChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}

