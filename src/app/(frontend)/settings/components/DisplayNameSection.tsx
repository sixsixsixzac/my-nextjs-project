"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { validateDisplayName } from "@/lib/utils/text-validation"

interface DisplayNameSectionProps {
  initialDisplayName?: string
  onSave?: (displayName: string) => void
}

export function DisplayNameSection({
  initialDisplayName = "",
  onSave,
}: DisplayNameSectionProps) {
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | undefined>(undefined)

  const handleChange = (value: string) => {
    setDisplayName(value)
    // Clear error when user starts typing
    if (error) {
      setError(undefined)
    }
  }

  const handleBlur = () => {
    const validation = validateDisplayName(displayName)
    if (!validation.isValid) {
      setError(validation.error)
    } else {
      setError(undefined)
    }
  }

  const handleSave = () => {
    const validation = validateDisplayName(displayName)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setError(undefined)
    if (onSave) {
      onSave(displayName.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          ชื่อแสดงผล
        </CardTitle>
        <CardDescription>
          ชื่อที่ใช้แสดงบนเว็บไซต์
          {initialDisplayName && (
            <span className="block mt-1 text-xs text-muted-foreground">
              ชื่อปัจจุบัน: <span className="font-medium">{initialDisplayName}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display-name">ชื่อแสดงผล</Label>
          <Input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="กรอกชื่อแสดงผล"
            className={`max-w-md ${error ? "border-destructive" : ""}`}
            aria-invalid={!!error}
            aria-describedby={error ? "display-name-error" : undefined}
          />
          {error && (
            <p
              id="display-name-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <Button 
          onClick={handleSave}
          disabled={!!error || !displayName.trim()}
        >
          บันทึกการเปลี่ยนแปลง
        </Button>
      </CardContent>
    </Card>
  )
}

