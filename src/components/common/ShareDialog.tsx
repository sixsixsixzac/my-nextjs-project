"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Facebook,
  Instagram,
  Link2,
  MessageCircle,
  Twitter,
  Copy,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface ShareDialogProps {
  open: boolean
  onClose: () => void
  url?: string
}

interface ShareButton {
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  ariaLabel: string
  color?: string
}

export function ShareDialog({ open, onClose, url }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // SSR-safe URL handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(url || window.location.href)
    }
  }, [url])

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(
    typeof document !== "undefined" ? document.title : ""
  )

  const shareButtons: ShareButton[] = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      ariaLabel: "Share on Facebook",
      color: "hover:bg-blue-500 hover:text-white",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      ariaLabel: "Share on X (Twitter)",
      color: "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: `https://www.instagram.com/`,
      ariaLabel: "Share on Instagram",
      color: "hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 hover:text-white",
    },
    {
      name: "Line",
      icon: MessageCircle,
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      ariaLabel: "Share on Line",
      color: "hover:bg-green-500 hover:text-white",
    },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleShare = (href: string, name: string) => {
    // Open share link in a new window
    window.open(
      href,
      "_blank",
      "width=600,height=400,menubar=no,toolbar=no,location=no,status=no"
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            Share this page with your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {shareButtons.map((button) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.name}
                  variant="outline"
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 h-auto py-4 transition-colors cursor-pointer",
                    button.color
                  )}
                  onClick={() => handleShare(button.href, button.name)}
                  aria-label={button.ariaLabel}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="text-xs font-medium">{button.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <label
              htmlFor="share-url"
              className="text-sm font-medium text-muted-foreground"
            >
              Or copy link
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="share-url"
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Share URL"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleCopyLink}
                aria-label={copied ? "Link copied" : "Copy link"}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    <span className="sr-only">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden="true" />
                    <span className="sr-only">Copy link</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

