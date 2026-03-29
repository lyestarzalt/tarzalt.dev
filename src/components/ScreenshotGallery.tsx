import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Screenshot {
  value: string
  label: string
  images: { src: string; alt: string }[]
}

const screenshots: Screenshot[] = [
  { value: "airport", label: "Airport", images: [{ src: "/images/projects/x-dispatch-airport.png", alt: "Airport detail view" }] },
  { value: "terrain", label: "3D Terrain", images: [{ src: "/images/projects/x-dispatch-terrain.png", alt: "3D terrain view" }] },
  { value: "flight", label: "Flight Setup", images: [{ src: "/images/projects/x-dispatch-flight-setup.png", alt: "Flight setup" }] },
  { value: "procedures", label: "SID/STAR", images: [{ src: "/images/projects/x-dispatch-procedures.png", alt: "SID/STAR procedures" }] },
  { value: "simbrief", label: "SimBrief", images: [
    { src: "/images/projects/x-dispatch-simbrief1.png", alt: "SimBrief import" },
    { src: "/images/projects/x-dispatch-simbrief2.png", alt: "SimBrief flight info" },
  ]},
  { value: "weather", label: "Weather", images: [{ src: "/images/projects/x-dispatch-weather.png", alt: "Weather setup" }] },
  { value: "tracking", label: "Tracking", images: [{ src: "/images/projects/x-dispatch-tracking.png", alt: "Live flight tracking" }] },
  { value: "addon", label: "Addons", images: [
    { src: "/images/projects/x-dispatch-addon1.png", alt: "Addon browser" },
    { src: "/images/projects/x-dispatch-addon2.png", alt: "Addon details" },
  ]},
  { value: "fuel", label: "Fuel", images: [{ src: "/images/projects/x-dispatch-fuel.png", alt: "Fuel and payload" }] },
  { value: "starting", label: "Start Pos", images: [{ src: "/images/projects/x-dispatch-starting.png", alt: "Starting position" }] },
]

export function ScreenshotGallery() {
  return (
    <Tabs defaultValue="airport">
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        {screenshots.map((s) => (
          <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
        ))}
      </TabsList>
      {screenshots.map((s) => (
        <TabsContent key={s.value} value={s.value}>
          <div className="space-y-3">
            {s.images.map((img) => (
              <div key={img.src} className="overflow-hidden rounded-xl border border-border">
                <img src={img.src} alt={img.alt} className="w-full" loading="lazy" />
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
