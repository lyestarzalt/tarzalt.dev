import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState, useEffect, useCallback } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';

export interface Screenshot {
  src: string;
  alt: string;
}

interface GalleryProps {
  screenshots: Screenshot[];
  maxWidth?: string;
  showNav?: boolean;
}

export function Gallery({ screenshots, maxWidth, showNav = true }: GalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className={maxWidth ?? undefined}>
      <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
        <CarouselContent>
          {screenshots.map((s, i) => (
            <CarouselItem key={i}>
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={s.src}
                  alt={s.alt}
                  className="w-full"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNav && (
          <>
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
          </>
        )}
      </Carousel>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground">{screenshots[current]?.alt}</p>
        <div className="flex gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`size-1.5 rounded-full transition-all ${
                i === current
                  ? 'bg-primary scale-125'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to ${screenshots[i].alt}`}
            />
          ))}
        </div>
        {showNav && (
          <p className="font-mono text-[0.625rem] text-muted-foreground/40">
            {current + 1} / {screenshots.length}
          </p>
        )}
      </div>
    </div>
  );
}
