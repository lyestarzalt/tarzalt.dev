import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useState, useEffect, useCallback } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

const screenshots = [
  { src: "/images/projects/x-dispatch/x-dispatch-map.png", label: "World Map" },
  { src: "/images/projects/x-dispatch/x-dispatch-airport.png", label: "Airport Detail" },
  { src: "/images/projects/x-dispatch/x-dispatch-terrain.png", label: "3D Terrain" },
  { src: "/images/projects/x-dispatch/x-dispatch-flight-setup.png", label: "Flight Setup" },
  { src: "/images/projects/x-dispatch/x-dispatch-procedures.png", label: "SID/STAR" },
  { src: "/images/projects/x-dispatch/x-dispatch-simbrief1.png", label: "SimBrief" },
  { src: "/images/projects/x-dispatch/x-dispatch-weather.png", label: "Weather" },
  { src: "/images/projects/x-dispatch/x-dispatch-tracking.png", label: "Live Tracking" },
  { src: "/images/projects/x-dispatch/x-dispatch-fuel.png", label: "Fuel & Payload" },
  { src: "/images/projects/x-dispatch/x-dispatch-starting.png", label: "Start Position" },
  { src: "/images/projects/x-dispatch/x-dispatch-addon1.png", label: "Addon Browser" },
]

export function ScreenshotGallery() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on("select", onSelect)
    return () => { api.off("select", onSelect) }
  }, [api, onSelect])

  return (
    <div>
      <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
        <CarouselContent>
          {screenshots.map((s, i) => (
            <CarouselItem key={i}>
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={s.src}
                  alt={s.label}
                  className="w-full"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
        <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
      </Carousel>

      {/* Label + dots */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground">
          {screenshots[current]?.label}
        </p>
        <div className="flex gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`size-1.5 rounded-full transition-all ${
                i === current
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to ${screenshots[i].label}`}
            />
          ))}
        </div>
        <p className="font-mono text-[0.625rem] text-muted-foreground/40">
          {current + 1} / {screenshots.length}
        </p>
      </div>
    </div>
  )
}
