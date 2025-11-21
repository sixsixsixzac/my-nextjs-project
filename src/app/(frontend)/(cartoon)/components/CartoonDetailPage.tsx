"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  UserPlus,
  Share2,
  Heart,
  FileText,
  Eye,
  Info,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";

interface CartoonDetailPageProps {
  type: "manga" | "novel";
  title: string;
  coverImage: string;
  author: {
    display_name: string;
    uuid: string;
    avatar?: string;
    is_online?: boolean;
  };
  stats: {
    episodes: number;
    views: number;
    likes: number;
  };
  description: string;
  episodes: Array<{
    id: number;
    number: number;
    title: string;
  }>;
  uuid?: string;
}

export function CartoonDetailPage({
  type,
  title,
  coverImage,
  author,
  stats,
  description,
  episodes,
  uuid,
}: CartoonDetailPageProps) {
  const shareText = type === "manga" ? "แชร์มังงะ" : "แชร์นิยาย";
  
  // Generate structured data for SEO
  // Use relative URL to avoid hydration mismatch
  const structuredData = useMemo(() => {
    const url = uuid ? `/${type}/${uuid}` : "/";
    
    return {
      "@context": "https://schema.org",
      "@type": type === "manga" ? "ComicSeries" : "Book",
      name: title,
      image: coverImage,
      description: description,
      author: {
        "@type": "Person",
        name: author.display_name,
        image: author.avatar,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.likes > 0 ? "4.5" : "0",
        ratingCount: stats.likes,
        reviewCount: stats.views,
      },
      numberOfPages: stats.episodes,
      url,
      ...(type === "manga" && {
        genre: "Manga",
      }),
    };
  }, [type, title, coverImage, description, author, stats, uuid]);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <article className="min-h-screen bg-background" itemScope itemType={type === "manga" ? "https://schema.org/ComicSeries" : "https://schema.org/Book"}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" itemProp="breadcrumb" className="text-xs sm:text-sm">หน้าแรก</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage itemProp="name" className="text-xs sm:text-sm">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </nav>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 sm:gap-6">
            {/* Cover Image - LCP optimization */}
            <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto lg:mx-0 rounded-lg overflow-hidden bg-muted">
              <OptimizedImage
                src={coverImage}
                alt={`${title} cover image`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                priority
                quality={90}
                fallbackText={title}
                itemProp="image"
              />
            {/* Title on cover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-4">
              <div className="text-white text-sm sm:text-lg font-bold line-clamp-2">{title}</div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title and Author */}
            <header className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight" itemProp="name">
                {title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between gap-3" itemScope itemType="https://schema.org/Person">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="size-10 border-2 border-white/20">
                      <AvatarImage 
                        src={author.avatar} 
                        alt={`${author.display_name} avatar`} 
                        itemProp="image"
                        loading="lazy"
                      />
                      <AvatarFallback>{author.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {author.is_online && (
                      <div 
                        className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-background" 
                        aria-label="Online"
                      />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-muted-foreground text-sm">โดย</span>
                    <Link
                      href={`/profile/${author.uuid}`}
                      className="text-foreground font-semibold text-base hover:text-primary transition-colors truncate"
                      itemProp="name"
                    >
                      {author.display_name}
                    </Link>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" aria-label="Follow this series">
                  <UserPlus className="size-4" aria-hidden="true" />
                  <span className="text-sm sm:text-base">+ ติดตาม</span>
                </Button>
              </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Card className="bg-blue-500/10 border-blue-500/20 p-2 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg shrink-0">
                    <FileText className="size-4 sm:size-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                      {stats.episodes}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">ตอน</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-green-500/10 border-green-500/20 p-2 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg shrink-0">
                    <Eye className="size-4 sm:size-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                      {stats.views.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">วิว</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20 p-2 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-red-500 rounded-lg shrink-0">
                    <Heart className="size-4 sm:size-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                      {stats.likes}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">ชอบ</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Details Section */}
            <section className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Info className="size-4 sm:size-5 text-blue-500 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">รายละเอียด</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed" itemProp="description">
                {description}
              </p>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Share2 className="size-4" />
                <span className="text-sm sm:text-base">{shareText}</span>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <Heart className="size-4" />
                <span className="text-sm sm:text-base">เพิ่มเข้าชั้นหนังสือ</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <section className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t" aria-labelledby="episodes-heading">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h2 id="episodes-heading" className="text-xl sm:text-2xl font-bold text-foreground">
              ตอนทั้งหมด {stats.episodes} ตอน
            </h2>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              <div className="text-sm sm:text-base text-green-500 font-semibold" aria-label="Total price">ราคารวม: 0</div>
              <Button className="bg-green-600 hover:bg-green-700 text-white shrink-0" aria-label="Purchase selected episodes">
                <ShoppingCart className="size-4" aria-hidden="true" />
                <span className="text-sm sm:text-base">ซื้อ ตอน</span>
              </Button>
            </div>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground">เลือกตอนที่ต้องการซื้อ</p>

          {/* Episode Groups */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger asChild>
              <Card className="bg-muted/50 p-3 sm:p-4 cursor-pointer hover:bg-muted transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Checkbox className="shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-foreground truncate">
                      ตอนที่ {episodes[0]?.number} - {episodes[episodes.length - 1]?.number}
                    </span>
                  </div>
                  <ChevronDown className="size-4 sm:size-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {episodes.map((episode) => (
                  <Card
                    key={episode.id}
                    className="p-2 sm:p-3 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Checkbox className="shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground truncate">{episode.title}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
        </div>
      </article>
    </>
  );
}

