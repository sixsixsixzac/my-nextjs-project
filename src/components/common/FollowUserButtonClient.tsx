"use client";

import { useState, useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUserButtonClientProps {
  targetUserUuid: string;
  initialIsFollowing: boolean;
  className?: string;
}

/**
 * Client-side FollowUserButton component
 * Handles the interactive follow/unfollow functionality using ToggleGroup
 */
export function FollowUserButtonClient({
  targetUserUuid,
  initialIsFollowing,
  className,
}: FollowUserButtonClientProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleValueChange = async (value: string) => {
    const willFollow = value === "following";
    
    // Optimistically update UI
    setIsFollowing(willFollow);

    startTransition(async () => {
      try {
        const response = await fetch("/api/user/follow", {
          method: willFollow ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetUserUuid }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error(
            `Error ${willFollow ? "following" : "unfollowing"} user:`,
            data.error
          );
          // Revert on error
          setIsFollowing(!willFollow);
        }
      } catch (error) {
        console.error("Error toggling follow status:", error);
        // Revert on error
        setIsFollowing(!willFollow);
      }
    });
  };

  return (
    <ToggleGroup
      type="single"
      value={isFollowing ? "following" : ""}
      onValueChange={handleValueChange}
      disabled={isPending}
      className={cn("shrink-0", className)}
    >
      <ToggleGroupItem
        value="following"
        variant="outline"
        className={cn(
          "justify-center gap-2",
          "data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:hover:bg-green-700",
          "data-[state=off]:bg-blue-600 data-[state=off]:text-white data-[state=off]:hover:bg-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label={isFollowing ? "Unfollow this user" : "Follow this user"}
        disabled={isPending}
      >
        {isFollowing ? (
          <>
            <UserCheck className="size-4" aria-hidden="true" />
            <span className="text-sm sm:text-base">กำลังติดตาม</span>
          </>
        ) : (
          <>
            <UserPlus className="size-4" aria-hidden="true" />
            <span className="text-sm sm:text-base">+ ติดตาม</span>
          </>
        )}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

