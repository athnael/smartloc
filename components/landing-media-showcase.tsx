"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, PlayCircle, Video } from "lucide-react";
import { useSmartlocStore } from "@/lib/store";
import type { LandingMedia } from "@/lib/types";

export function LandingMediaShowcase() {
  const media = useSmartlocStore((state) => state.landingMedia);
  const loadFromApi = useSmartlocStore((state) => state.loadFromApi);
  const photos = useMemo(() => media.filter((item) => item.type === "image"), [media]);
  const videos = useMemo(() => media.filter((item) => item.type === "video"), [media]);

  useEffect(() => {
    void loadFromApi();
  }, [loadFromApi]);

  if (!media.length) return null;

  return (
    <section id="galeri" className="px-6 pb-20 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-orange-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-land via-[#ffc62c] to-coral px-6 py-8 text-ink sm:px-9">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
          <div className="relative">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-xs font-black uppercase tracking-[.16em] text-ocean">
                <ImagePlus className="h-4 w-4 text-coral" /> Dokumentasi lokasi
              </div>
              <h2 className="mt-4 max-w-4xl font-serif text-3xl font-bold leading-tight text-ocean sm:text-4xl">
                Lihat suasana setiap lokasi sebelum menentukan tempat usaha terbaik.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink/70">
                Foto dan video membantu pengguna memahami kondisi sekitar, akses jalan, dan karakter kawasan secara lebih nyata.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-4 sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-serif text-2xl font-bold text-ocean">Foto Lokasi</h3>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((slot) => (
                <PhotoSlot key={slot} photos={photos} slot={slot} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-serif text-2xl font-bold text-ocean">Video Lokasi</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((slot) => (
                <VideoSlot key={slot} videos={videos} slot={slot} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoSlot({ photos, slot }: { photos: LandingMedia[]; slot: number }) {
  const [index, setIndex] = useState(slot);
  const [isFading, setIsFading] = useState(false);
  const photo = photos.length ? photos[index % photos.length] : null;

  useEffect(() => {
    if (photos.length <= 1) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setIsFading(true);
      window.setTimeout(() => {
        setIndex((current) => current + 3);
        window.setTimeout(() => setIsFading(false), 80);
      }, 260);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  if (!photo) return <EmptyMediaCard label="Belum ada foto" />;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-orange-100 bg-[#fffdf8] shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-mist">
        <img src={photo.url} alt={photo.title} className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${isFading ? "opacity-0" : "opacity-100"}`} />
      </div>
      <MediaCaption item={photo} icon="image" />
    </article>
  );
}

function VideoSlot({ videos, slot }: { videos: LandingMedia[]; slot: number }) {
  const [index, setIndex] = useState(slot);
  const [isFading, setIsFading] = useState(false);
  const video = videos.length ? videos[index % videos.length] : null;

  function nextVideo() {
    if (videos.length <= 1) return;
    setIsFading(true);
    window.setTimeout(() => {
      setIndex((current) => current + 3);
      window.setTimeout(() => setIsFading(false), 80);
    }, 260);
  }

  if (!video) return <EmptyMediaCard label="Belum ada video" tall />;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-orange-100 bg-[#fffdf8] shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-ocean">
        <div className="h-full w-full overflow-hidden bg-black">
          <video
            key={video.id}
            src={video.url}
            poster={video.posterUrl}
            autoPlay
            muted
            loop={videos.length <= 1}
            playsInline
            onEnded={nextVideo}
            className={`h-full w-full object-cover transition duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}
          />
        </div>
      </div>
      <MediaCaption item={video} icon="video" />
    </article>
  );
}

function MediaCaption({ item, icon }: { item: LandingMedia; icon: "image" | "video" }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-coral">
        {icon === "video" ? <Video className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
        {item.locationName}
      </div>
      <h4 className="mt-1 truncate text-sm font-extrabold text-ocean">{item.title}</h4>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-ink/70">{item.caption}</p>
    </div>
  );
}

function EmptyMediaCard({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div className={`grid place-items-center rounded-[1.5rem] border border-dashed border-orange-200 bg-mist text-xs font-bold text-ink/45 ${tall ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
      {label}
    </div>
  );
}
