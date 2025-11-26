"use client";

import { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CartoonCard, type CartoonCardProps } from "@/components/common/CartoonCard";

type CartoonCarouselProps = {
  title?: string;
  items: CartoonCardProps[];
  /** Optional className for the outer wrapper */
  className?: string;
};

export function CartoonCarousel({ title, items, className }: CartoonCarouselProps) {
  const slides = useMemo(() => items, [items]);

  if (!slides.length) return null;

  return (
    <section className={className} aria-label={title || "แนะนำการ์ตูน"}>
      {title && (
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
            {title}
          </h2>
        </header>
      )}

      <div className="relative">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: false,
            // Mobile / touch: follow finger and stop where you release
            dragFree: true,
            skipSnaps: true,
            slidesToScroll: 1,
            // Desktop / tablet: buttons still jump exactly 6 items
            breakpoints: {
              "(min-width: 768px)": {
                dragFree: false,
                skipSnaps: false,
                slidesToScroll: 6,
              },
            },
            containScroll: "trimSnaps",
          }}
        >
          <CarouselContent className="md:-ml-3 lg:-ml-4">
            {slides.map((item) => (
              <CarouselItem
                key={item.uuid}
                className="pl-2 xs:pl-3 sm:pl-3 md:pl-3 lg:pl-4 basis-[40%] sm:basis-[32%] md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
              >
                <CartoonCard {...item} className="h-full" />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Desktop / tablet navigation buttons */}
          <div className="pointer-events-none hidden md:block">
            <CarouselPrevious className="pointer-events-auto hidden md:flex" />
            <CarouselNext className="pointer-events-auto hidden md:flex" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

