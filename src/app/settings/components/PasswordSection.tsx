'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { fetchService, type FetchError } from '@/lib/services/fetch-service'
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
  getPasswordStrengthLabel,
  type PasswordStrength,
} from '@/lib/utils/password-strength'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  newPassword: z
    .string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลขอย่างน้อยอย่างละ 1 ตัว'
    ),
  confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่านใหม่'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function PasswordSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak')
  const [passwordScore, setPasswordScore] = useState(0)
  const lastSubmitTime = useRef<number>(0)
  const RATE_LIMIT_MS = 2000 // 2 seconds between submissions

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Watch new password for strength calculation
  const newPassword = passwordForm.watch('newPassword')

  // Calculate password strength when new password changes
  useEffect(() => {
    if (newPassword) {
      const strengthResult = calculatePasswordStrength(newPassword)
      setPasswordStrength(strengthResult.strength)
      setPasswordScore(strengthResult.score)
    } else {
      setPasswordStrength('weak')
      setPasswordScore(0)
    }
  }, [newPassword])

  const onPasswordSubmit = async (data: PasswordFormData) => {
    // Client-side rate limiting: prevent rapid submissions
    const now = Date.now()
    const timeSinceLastSubmit = now - lastSubmitTime.current

    if (timeSinceLastSubmit < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000)
      toast.error(`กรุณารอ ${waitTime} วินาทีก่อนส่งอีกครั้ง`)
      return
    }

    lastSubmitTime.current = now
    setIsLoading(true)

    try {
      const result = await fetchService.put<{
        success: boolean
        message?: string
      }>('/api/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      toast.success('เปลี่ยนรหัสผ่านสำเร็จ', {
        description: result.message || 'รหัสผ่านของคุณได้รับการอัปเดตแล้ว',
      })

      // Clear form on success
      passwordForm.reset()
    } catch (error) {
      console.error('Error changing password:', error)
      
      // Handle rate limit errors specifically
      if (error && typeof error === 'object' && 'status' in error) {
        const fetchError = error as FetchError
        if (fetchError.status === 429) {
          const errorData = fetchError.data as { message?: string; retryAfter?: number } | undefined
          const retryAfter = errorData?.retryAfter || 60
          toast.error('ส่งคำขอบ่อยเกินไป', {
            description: errorData?.message || `กรุณารอ ${retryAfter} วินาทีก่อนลองอีกครั้ง`,
          })
          return
        }
      }
      
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="size-5" />
          <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
        </div>
        <CardDescription>
          เปลี่ยนรหัสผ่านของคุณเพื่อความปลอดภัย
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่านปัจจุบัน</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="กรุณากรอกรหัสผ่านปัจจุบัน"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่านใหม่</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="กรุณากรอกรหัสผ่านใหม่"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {newPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${getPasswordStrengthTextColor(passwordStrength)}`}>
                          {getPasswordStrengthLabel(passwordStrength)}
                        </span>
                        <span className="text-muted-foreground">{passwordScore}%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="กรุณายืนยันรหัสผ่านใหม่"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  กำลังเปลี่ยนรหัสผ่าน...
                </>
              ) : (
                'เปลี่ยนรหัสผ่าน'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

