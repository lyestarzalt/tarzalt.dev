import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useState, useEffect, useCallback } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';

const screenshots = [
  { src: '/images/projects/dinar-echange/screenshot-currencies.png', label: 'Currency Rates' },
  { src: '/images/projects/dinar-echange/screenshot-converter.png', label: 'Converter' },
  { src: '/images/projects/dinar-echange/screenshot-trends.png', label: 'Trends' },
];

export function DinarScreenshotGallery() {
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
    <div className="mx-auto max-w-xs">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {screenshots.map((s, i) => (
            <CarouselItem key={i}>
              <div className="overflow-hidden rounded-2xl border border-border">
                <img
                  src={s.src}
                  alt={s.label}
                  className="w-full"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground">{screenshots[current]?.label}</p>
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
              aria-label={`Go to ${screenshots[i].label}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
