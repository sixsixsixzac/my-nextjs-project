"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EpisodeHeaderProps } from "./types";

export function EpisodeHeader({
  episodeInfo,
  navigation,
  onNavigate,
  isLoading = false,
}: EpisodeHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          {episodeInfo ? (
            <div>
              <h2 className="text-lg font-semibold">ตอนที่ {episodeInfo.epNo}</h2>
              <p className="text-sm text-muted-foreground">{episodeInfo.epName}</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(navigation?.prevEpNo ?? null)}
            disabled={!navigation?.prevEpNo}
            className={`p-2 rounded-md transition-colors ${
              navigation?.prevEpNo
                ? "hover:bg-accent cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Previous episode"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate(navigation?.nextEpNo ?? null)}
            disabled={!navigation?.nextEpNo}
            className={`p-2 rounded-md transition-colors ${
              navigation?.nextEpNo
                ? "hover:bg-accent cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Next episode"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

